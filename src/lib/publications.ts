import { getCollection, type CollectionEntry } from "astro:content";

export type Publication = CollectionEntry<"publications">;

/** Publications, newest first: by year, then by date (undated last within a year), then by title. */
export async function getPublications(): Promise<Publication[]> {
  const publications = await getCollection("publications");
  const time = (publication: Publication) => publication.data.date?.getTime() ?? -Infinity;
  return publications.sort(
    (a, b) => b.data.year - a.data.year || time(b) - time(a) || a.data.title.localeCompare(b.data.title, "en")
  );
}

/** Link to a publication: its DOI address, or its `url`. The schema limits DOIs to URL-safe characters. */
export function publicationHref(publication: Publication): string {
  const { doi, url } = publication.data;
  return doi ? `https://doi.org/${doi}` : url!;
}
