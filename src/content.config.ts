import { defineCollection } from "astro:content";
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
      })
    })
});

// Stand-alone pages; the file name is the page id (content/pages/404.md → "404").
// `labels` holds short texts a page's layout needs, such as section headings.
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/pages" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    labels: z.record(z.string(), z.string().min(1)).default({})
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
        status: z.enum(["current", "former"]),
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
        projects: z.array(z.string().min(1)).default([])
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
        date: calendarDate.optional(),
        endDate: calendarDate.optional(),
        location: z.string().min(1).optional(),
        link: z.url({ protocol: /^https?$/ }).optional(),
        image: image().optional(),
        imageAlt: altText.optional()
      })
      .refine(hasAltText, altTextIssue)
      .refine((event) => !event.endDate || (event.date && event.endDate >= event.date), {
        message: "`endDate` needs a `date` on or before it",
        path: ["endDate"]
      })
});

export const collections = { home, pages, people, news, events };
