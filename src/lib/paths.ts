import { addBasePath } from "./base-path.mjs";

/** Adds the site's base path to a root-relative path such as "/people/"; other values pass through. */
export function withBase(path: string): string {
  return addBasePath(import.meta.env.BASE_URL, path) as string;
}
