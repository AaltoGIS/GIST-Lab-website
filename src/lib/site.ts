import { parse } from "yaml";
import { z } from "astro/zod";
import raw from "../../content/site.yml?raw";

const siteSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().min(1),
  description: z.string().min(1)
});

/** Parses content/site.yml and checks it against the schema; throws with the invalid fields listed. */
function loadSite() {
  const result = siteSchema.safeParse(parse(raw));
  if (!result.success) {
    throw new Error(`content/site.yml is invalid:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Validated contents of content/site.yml. */
export const site = loadSite();
