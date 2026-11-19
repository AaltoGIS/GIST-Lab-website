import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { linkSchema } from "./lib/schemas";

// A year or year range; YAML reads `2023` as a number, so both forms are accepted.
const yearText = z.union([z.number().int(), z.string().min(1)]).transform(String);

// A calendar day written as 2026-10-19. Unquoted dates arrive already parsed by YAML
// (which rolls 2026-02-30 over to 2 March; tests/content-dates.test.mjs catches that);
// quoted ones are checked here.
const calendarDate = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use the form YYYY-MM-DD")])
  .transform((value, ctx) => {
    const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || (typeof value === "string" && date.toISOString().slice(0, 10) !== value)) {
      ctx.addIssue({ code: "custom", message: `${String(value)} is not a calendar date` });
      return z.NEVER;
    }
    return date;
  });

// A month written as 2025-02, for events whose days are not known.
const calendarMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "use the form YYYY-MM");
const monthStart = (month: string) => new Date(`${month}-01T00:00:00Z`);
const monthEnd = (month: string) => {
  const end = monthStart(month);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  return end;
};

// Alt text: surrounding spaces are removed, so a blank value counts as missing.
const altText = z.string().trim().min(1);

// Requires alt text whenever an image is set.
const hasAltText = (entry: { image?: unknown; imageAlt?: string }) => !entry.image || Boolean(entry.imageAlt);
const altTextIssue = { message: "`imageAlt` is required when `image` is set", path: ["imageAlt"] };

const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "./content" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      hero: z.object({
        title: z.string().min(1),
        text: z.string().min(1),
        image: image(),
        imageAlt: altText,
        imagePosition: z.string().default("50% 50%"),
        credit: z.string().default(""),
        actions: z.array(linkSchema).default([])
      }),
      labels: z.record(z.string(), z.string().min(1)).default({}),
      team: z
        .object({ image: image(), imageAlt: altText, text: z.string().min(1) })
        .optional(),
      // Logos in the funder strip; `name` is also the logo's alt text.
      funders: z.array(z.object({ name: altText, logo: image(), href: z.url({ protocol: /^https?$/ }).optional() })).default([])
    })
});

// Pages: intro texts of list pages (people.md, news.md, ...) and stand-alone pages. The file
// name is the page id; with `standalone: true` the page is published at /<id>/.
// `labels` holds short texts a page's layout needs, such as section headings;
// `cards` is an optional list of entries shown as cards (courses, software, datasets).
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/pages" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1).optional(),
      standalone: z.boolean().default(false),
      labels: z.record(z.string(), z.string().min(1)).default({}),
      cards: z
        .array(
          z
            .object({
              title: z.string().min(1),
              meta: z.string().min(1).optional(),
              text: z.string().min(1).optional(),
              image: image().optional(),
              imageAlt: altText.optional(),
              links: z.array(linkSchema).default([])
            })
            .refine(hasAltText, altTextIssue)
        )
        .default([])
    })
});

// Lab members; the file name is the page address (content/people/jane-doe.md → /people/jane-doe/).
// Former members get no profile page; they are listed on the People page.
const people = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/people" }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string().min(1),
        prefix: z.string().min(1).optional(),
        role: z.string().min(1).optional(),
        status: z.enum(["current", "affiliate", "former"]),
        order: z.number().int().default(100),
        affiliation: z.string().min(1).optional(),
        photo: image().optional(),
        photoAlt: altText.optional(),
        photoPosition: z.string().default("50% 10%"),
        photoZoom: z.number().min(1).max(3).default(1),
        email: z
          .email()
          .refine((value) => !value.startsWith("firstname.lastname@"), "use `emailText` for an address pattern such as firstname.lastname@aalto.fi")
          .optional(),
        emailText: z.string().min(1).optional(),
        links: z.array(linkSchema).default([]),
        education: z
          .array(
            z.object({
              year: yearText,
              degree: z.string().min(1),
              institution: z.string().min(1)
            })
          )
          .default([]),
        years: yearText
          .refine((value) => /^\d{4}(?:\s*[–-]\s*\d{4})?$/.test(value), "`years` must be a year or a range such as 2022–2024")
          .optional(),
        note: z.string().min(1).optional()
      })
      .refine((person) => person.status === "former" || person.role, {
        message: "`role` is required for current members",
        path: ["role"]
      })
      .refine((person) => person.status !== "former" || person.years, {
        message: "`years` is required for former members",
        path: ["years"]
      })
});

// News posts: content/news/2026-10-19-some-title.md → /news/some-title/ (the date prefix only sorts the files).
const news = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "./content/news",
    generateId: ({ entry }) => entry.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        date: calendarDate,
        author: z.string().min(1).optional(),
        image: image().optional(),
        imageAlt: altText.optional(),
        imagePosition: z.string().default("50% 50%"),
        summary: z.string().min(1).optional(),
        projects: z.array(reference("projects")).default([])
      })
      .refine(hasAltText, altTextIssue)
});

// Events: content/events/some-event.md → /events/some-event/. Upcoming or past is decided at build time.
const events = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/events" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        date: z.union([calendarDate, calendarMonth]).optional(),
        endDate: z.union([calendarDate, calendarMonth]).optional(),
        location: z.string().min(1).optional(),
        link: z.url({ protocol: /^https?$/ }).optional(),
        image: image().optional(),
        imageAlt: altText.optional()
      })
      .refine(hasAltText, altTextIssue)
      .refine((event) => !event.date || !event.endDate || typeof event.date === typeof event.endDate, {
        message: "give `date` and `endDate` both as days (YYYY-MM-DD) or both as months (YYYY-MM)",
        path: ["endDate"]
      })
      // Month dates span whole months: `date` is the first day, `endDate` the last day of its month.
      .transform(({ date, endDate, ...event }) => {
        const byMonth = typeof date === "string";
        return {
          ...event,
          byMonth,
          date: typeof date === "string" ? monthStart(date) : date,
          endDate: typeof endDate === "string" ? monthEnd(endDate) : byMonth ? monthEnd(date as string) : endDate
        };
      })
      .refine((event) => !event.endDate || (event.date && event.endDate >= event.date), {
        message: "`endDate` needs a `date` on or before it",
        path: ["endDate"]
      })
});

// Research projects: content/projects/mapico.md → /research/mapico/. With `page: false` the
// project is only listed on the Research page.
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/projects" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        shortTitle: z.string().min(1).optional(),
        years: yearText.optional(),
        status: z.enum(["ongoing", "past"]),
        order: z.number().int().default(100),
        funders: z.array(z.string().min(1)).default([]),
        pi: z.string().min(1).optional(),
        coordinator: z.string().min(1).optional(),
        website: z.url({ protocol: /^https?$/ }).optional(),
        logo: image().optional(),
        logoAlt: altText.optional(),
        summary: z.string().min(1).optional(),
        team: z.array(reference("people")).default([]),
        page: z.boolean().default(true)
      })
      .refine((project) => !project.logo || Boolean(project.logoAlt), {
        message: "`logoAlt` is required when `logo` is set",
        path: ["logoAlt"]
      })
});

// Publications: one file per paper; the body is the abstract (optional).
const publications = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/publications" }),
  schema: z
    .object({
      title: z.string().min(1),
      authors: z.string().min(1),
      year: z.number().int().min(1900).max(2100),
      // Publication date from the record; orders the entries within a year.
      date: calendarDate.optional(),
      venue: z.string().min(1),
      // Crossref's recommended DOI pattern; it keeps the DOI usable as a URL path as is.
      doi: z
        .string()
        .regex(/^10\.\d{4,9}\/[-._;()/:a-z0-9]+$/i, "write the DOI without https://doi.org/, e.g. 10.1038/s41467-025-56906-7")
        .refine((doi) => !/(^|\/)\.{1,2}(\/|$)/.test(doi), "a DOI cannot contain . or .. path segments")
        .optional(),
      url: z.url({ protocol: /^https?$/ }).optional(),
      openAccess: z.boolean().default(false),
      people: z.array(reference("people")).default([]),
      projects: z.array(reference("projects")).default([])
    })
    .refine((publication) => publication.doi || publication.url, { message: "give a `doi` or a `url`", path: ["doi"] })
});

export const collections = { home, pages, people, news, events, projects, publications };
