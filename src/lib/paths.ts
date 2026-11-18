import { addBasePath } from "./base-path.mjs";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Adds the site's base path to a root-relative path such as "/people/"; other values pass through. */
export function withBase(path: string): string {
  return addBasePath(import.meta.env.BASE_URL, path) as string;
}

/** Returns the current page's path without the base path, e.g. "/people/". */
export function pagePath(pathname: string): string {
  const path = base && (pathname === base || pathname.startsWith(`${base}/`)) ? pathname.slice(base.length) : pathname;
  return path || "/";
}
