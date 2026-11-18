import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "./content" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1)
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
