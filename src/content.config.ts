import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { linkSchema } from "./lib/schemas";

// A year or year range; YAML reads `2023` as a number, so both forms are accepted.
const yearText = z.union([z.number().int(), z.string().min(1)]).transform(String);

const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "./content" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      hero: z.object({
        title: z.string().min(1),
        subtitle: z.string().min(1),
        text: z.string().min(1),
        image: image(),
        imageAlt: z.string().min(1),
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
        group: z.enum(["pi", "staff", "postdoc", "doctoral", "visiting", "former"]),
        order: z.number().int().default(100),
        affiliation: z.string().min(1).optional(),
        photo: image().optional(),
        photoAlt: z.string().min(1).optional(),
        photoPosition: z.string().default("50% 30%"),
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
      .refine((person) => person.group === "former" || person.role, {
        message: "`role` is required for current members",
        path: ["role"]
      })
      .refine((person) => person.group !== "former" || person.years, {
        message: "`years` is required for former members",
        path: ["years"]
      })
});

export const collections = { home, pages, people };
