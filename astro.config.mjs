import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import { parse } from "yaml";
import { addBasePath } from "./src/lib/base-path.mjs";
import baseLinksPlugin from "./src/lib/base-links-plugin.mjs";
import { base, site } from "./site.config.mjs";

// Old WordPress addresses → new pages (content/redirects.yml).
const redirects = parse(readFileSync(new URL("./content/redirects.yml", import.meta.url), "utf8")) ?? {};
// A site path: one leading slash, no backslashes, whitespace or encoded separators,
// and no . or .. segments, also after percent-decoding.
const isSitePath = (value) => {
  if (typeof value !== "string" || !/^\/(?!\/)[^\s\\]*$/.test(value) || /%(2f|5c)/i.test(value)) return false;
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  return ![value, decoded].some((path) => /(^|\/)\.{1,2}(\/|$)/.test(path));
};
for (const [from, to] of Object.entries(redirects)) {
  if (!isSitePath(from) || !isSitePath(to)) {
    throw new Error(`content/redirects.yml: "${from}: ${to}" must map a site path such as /old/ to another, such as /new/`);
  }
}
const redirectPaths = new Set(Object.keys(redirects).map((from) => from.replace(/\/?$/, "/")));
// Astro does not add the base path to redirect targets.
const redirectTargets = Object.fromEntries(Object.entries(redirects).map(([from, to]) => [from, addBasePath(base, to)]));

export default defineConfig({
  site,
  base,
  output: "static",
  redirects: redirectTargets,
  integrations: [
    sitemap({
      filter: (page) => !redirectPaths.has(new URL(page).pathname.slice(base.replace(/\/$/, "").length).replace(/\/?$/, "/"))
    })
  ],
  markdown: {
    processor: satteri({ hastPlugins: [baseLinksPlugin(base)] })
  }
});
