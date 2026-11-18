import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import baseLinksPlugin from "./src/lib/base-links-plugin.mjs";

// Served from the repository's GitHub Pages URL until gistlab.science points
// to GitHub Pages. After the DNS switch: site "https://gistlab.science",
// base "/", and a public/CNAME file containing "gistlab.science".
const site = "https://aaltogis.github.io";
const base = "/GIST-Lab-website";

export default defineConfig({
  site,
  base,
  output: "static",
  markdown: {
    processor: satteri({ hastPlugins: [baseLinksPlugin(base)] })
  }
});
