import type { CollectionEntry } from "astro:content";

/** Returns `labels[key]` from a content/pages entry; throws naming the file when it is missing. */
export function pageLabel(page: CollectionEntry<"pages">, key: string): string {
  const label = page.data.labels[key];
  if (!label) throw new Error(`content/pages/${page.id}.md: labels.${key} is missing`);
  return label;
}
