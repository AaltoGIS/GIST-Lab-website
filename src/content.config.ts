import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { linkSchema } from "./lib/schemas";

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
        imageAlt: z.string().min(1),
        imagePosition: z.string().default("50% 50%"),
        credit: z.string().default(""),
        actions: z.array(linkSchema).default([])
      })
    })
});

// Stand-alone pages; the file name is the page id (content/pages/404.md → "404").
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/pages" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).optional()
  })
});

export const collections = { home, pages };
