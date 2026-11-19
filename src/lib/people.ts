import { getCollection, type CollectionEntry } from "astro:content";

export type Person = CollectionEntry<"people">;

/** Name with its prefix, e.g. "Dr. Jane Doe". */
export function displayName(person: Person): string {
  return [person.data.prefix, person.data.name].filter(Boolean).join(" ");
}

/** Last year in a former member's `years`, e.g. 2023 for "2022–2023"; 0 when absent. */
function endYear(person: Person): number {
  return Number(person.data.years?.match(/(\d{4})\s*$/)?.[1] ?? 0);
}

/** Alt text for a person's photo: `photoAlt`, or "Photo of <name>". */
export function photoAlt(person: Person): string {
  return person.data.photoAlt ?? `Photo of ${person.data.name}`;
}

/**
 * All people sorted for display: current members first, by `order`; former
 * members by most recent years; then by name.
 */
export async function getPeople(): Promise<Person[]> {
  const people = await getCollection("people");
  return people.sort((a, b) => {
    const byStatus = Number(a.data.status === "former") - Number(b.data.status === "former");
    if (byStatus) return byStatus;
    const byOrder = a.data.status === "former" ? endYear(b) - endYear(a) : a.data.order - b.data.order;
    return byOrder || a.data.name.localeCompare(b.data.name, "en");
  });
}
