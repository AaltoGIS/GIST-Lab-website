import { getCollection, type CollectionEntry } from "astro:content";
import { formatDateRange, formatMonthRange, isoDay } from "./dates";

export type LabEvent = CollectionEntry<"events">;

const LOCAL_DAY = new Intl.DateTimeFormat("en", { timeZone: "Europe/Helsinki", year: "numeric", month: "numeric", day: "numeric" });

/** Start of the given moment's calendar day in Helsinki, as a UTC midnight timestamp. */
function localDayStart(moment: Date): number {
  const part = (type: string) => Number(LOCAL_DAY.formatToParts(moment).find((p) => p.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"));
}

/**
 * Events split at the build date (Helsinki time): upcoming ones (ending today or later)
 * soonest first, past ones newest first, undated ones last among the past.
 */
export async function getEvents(today = new Date()): Promise<{ upcoming: LabEvent[]; past: LabEvent[] }> {
  const events = await getCollection("events");
  // "Today" is the lab's local calendar day; event dates are stored as UTC midnights.
  const startOfToday = localDayStart(today);
  const last = (event: LabEvent) => (event.data.endDate ?? event.data.date)?.getTime();
  const upcoming = events
    .filter((event) => (last(event) ?? -Infinity) >= startOfToday)
    .sort((a, b) => a.data.date!.getTime() - b.data.date!.getTime());
  const past = events
    .filter((event) => !upcoming.includes(event))
    .sort((a, b) => (last(b) ?? -Infinity) - (last(a) ?? -Infinity) || a.data.title.localeCompare(b.data.title, "en"));
  return { upcoming, past };
}

/** An event's dates for `<time>`: "7–9 May 2025", or "February – May 2025" for month dates. */
export function eventDates(event: LabEvent): { datetime: string; text: string } | undefined {
  const { date, endDate, byMonth } = event.data;
  if (!date) return undefined;
  return byMonth
    ? { datetime: isoDay(date).slice(0, 7), text: formatMonthRange(date, endDate) }
    : { datetime: isoDay(date), text: formatDateRange(date, endDate) };
}
