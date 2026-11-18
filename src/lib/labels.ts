import type { CollectionEntry } from "astro:content";

/**
 * Returns `labels[key]` from content/home.md or a content/pages entry; throws
 * naming the file when the label is missing.
 */
export function pageLabel(page: CollectionEntry<"pages"> | CollectionEntry<"home">, key: string): string {
  const label = page.data.labels[key];
  if (!label) {
    const file = page.collection === "home" ? "content/home.md" : `content/pages/${page.id}.md`;
    throw new Error(`${file}: labels.${key} is missing`);
  }
  return label;
}
