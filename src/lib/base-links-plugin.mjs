import { addBasePath } from "./base-path.mjs";

/**
 * Sätteri hast plugin that adds the site's base path to root-relative link
 * targets (`a href`) and image sources (`img src`) in rendered Markdown, so a
 * link written as `/people/` works when the site is served from a subpath.
 *
 * @param {string} base Astro `base` option, e.g. "/GIST-Lab-website".
 */
export default function baseLinksPlugin(base) {
  return {
    name: "base-links",
    element: {
      filter: ["a", "img"],
      visit(node, ctx) {
        const key = node.tagName === "a" ? "href" : "src";
        const value = node.properties?.[key];
        const next = addBasePath(base, value);
        if (next !== value) ctx.setProperty(node, key, next);
      }
    }
  };
}
