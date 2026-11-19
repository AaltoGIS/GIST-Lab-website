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

/** Display order of the statuses on the People page. */
const STATUS_ORDER: Person["data"]["status"][] = ["current", "affiliate", "former"];

/**
 * All people sorted for display: current members, then affiliates, both by
 * `order`; then former members by most recent years; ties by name.
 */
export async function getPeople(): Promise<Person[]> {
  const people = await getCollection("people");
  return people.sort((a, b) => {
    const byStatus = STATUS_ORDER.indexOf(a.data.status) - STATUS_ORDER.indexOf(b.data.status);
    if (byStatus) return byStatus;
    const byOrder = a.data.status === "former" ? endYear(b) - endYear(a) : a.data.order - b.data.order;
    return byOrder || a.data.name.localeCompare(b.data.name, "en");
  });
}
