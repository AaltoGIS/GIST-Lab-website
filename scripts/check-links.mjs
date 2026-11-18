// Checks that every internal link and asset reference in the built site (dist/)
// points to a file that exists. Usage: node scripts/check-links.mjs [dist]
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { base as configuredBase, site } from "../site.config.mjs";

const dist = process.argv[2] ?? "dist";
const base = configuredBase.replace(/\/$/, "");
const origin = new URL(site).origin;

/** Site paths ("/people/index.html") of all regular files below dist/; symbolic links are skipped. */
function builtFiles(dir, files = new Set()) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = lstatSync(path);
    if (stat.isDirectory()) builtFiles(path, files);
    else if (stat.isFile()) files.add(`/${relative(dist, path).split(sep).join("/")}`);
  }
  return files;
}

const files = builtFiles(dist);

/** Whether a site path below the base, e.g. "/people/", resolves to a built file. */
function exists(sitePath) {
  let path;
  try {
    path = decodeURIComponent(sitePath);
  } catch {
    return false;
  }
  return path.endsWith("/") ? files.has(`${path}index.html`) : files.has(path) || files.has(`${path}/index.html`);
}

/**
 * URLs in a page: href, src, srcset and poster attributes (quoted or not), full
 * addresses in meta content (og:url, og:image) and meta refresh targets.
 */
function references(html) {
  const refs = [];
  for (const [, attr, , quoted, bare] of html.matchAll(/\s(href|src|srcset|poster)\s*=\s*(?:(["'])(.*?)\2|([^\s"'>]+))/gi)) {
    const value = quoted ?? bare;
    if (attr.toLowerCase() === "srcset") refs.push(...value.split(",").map((part) => part.trim().split(/\s+/)[0]));
    else refs.push(value);
  }
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const content = tag.match(/\scontent\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "";
    if (/http-equiv\s*=\s*["']?refresh/i.test(tag)) refs.push(content.replace(/^\s*\d+\s*;\s*url\s*=\s*/i, ""));
    else if (/^https?:\/\//i.test(content)) refs.push(content);
  }
  return refs.filter(Boolean);
}

/** Full addresses in an XML feed or sitemap (<loc>, <link>). */
function xmlReferences(xml) {
  return [...xml.matchAll(/<(loc|link)>\s*([^<\s]+)\s*<\/\1>/g)].map((m) => m[2]);
}

const broken = [];
for (const page of [...files].filter((path) => /\.(html|xml)$/.test(path))) {
  const from = new URL(`${base}${page.replace(/(^|\/)index\.html$/, "$1")}`, origin);
  const text = readFileSync(join(dist, page), "utf8");
  for (const ref of page.endsWith(".xml") ? xmlReferences(text) : references(text)) {
    if (/^(?:mailto|tel|data|javascript):/i.test(ref) || ref.startsWith("#")) continue;
    const target = new URL(ref.replaceAll("&amp;", "&"), from);
    if (target.origin !== origin) continue;
    const path = target.pathname;
    const insideBase = path === base || path.startsWith(`${base}/`);
    // A full address to another site on the same host (another project) is external.
    if (!insideBase && /^[a-z][a-z0-9+.-]*:/i.test(ref)) continue;
    if (!insideBase) {
      broken.push(`dist${page}: ${ref} (outside the base path ${base})`);
    } else if (!exists(path.slice(base.length) || "/")) {
      broken.push(`dist${page}: ${ref}`);
    }
  }
}

if (broken.length) {
  console.error(`${broken.length} broken internal link(s):\n${[...new Set(broken)].join("\n")}`);
  process.exit(1);
}
console.log("All internal links resolve.");
