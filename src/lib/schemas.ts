import { z } from "astro/zod";

/** A labelled link: a page of this site ("/people/"), a web address or a mailto: address. */
export const linkSchema = z.object({
  label: z.string().min(1),
  href: z
    .string()
    .regex(/^(?:\/(?!\/)|https?:\/\/|mailto:)/, "use a site path starting with /, an http(s):// address or mailto:")
});
