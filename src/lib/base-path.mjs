/**
 * Adds a base path to a root-relative path: with base "/GIST-Lab-website",
 * "/people/" becomes "/GIST-Lab-website/people/". External URLs, "#anchors",
 * relative paths and paths that already start with the base are returned
 * unchanged.
 *
 * @param {string} base Astro `base` option, with or without a trailing slash.
 * @param {unknown} value Link target or image source.
 * @returns {unknown}
 */
export function addBasePath(base, value) {
  const prefix = base.replace(/\/$/, "");
  if (!prefix || typeof value !== "string") return value;
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  if (value === prefix || value.startsWith(`${prefix}/`)) return value;
  return `${prefix}${value}`;
}
