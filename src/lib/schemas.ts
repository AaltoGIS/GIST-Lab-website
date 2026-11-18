import { z } from "astro/zod";

/** A labelled link; `href` starting with "/" is a page of this site. */
export const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});
