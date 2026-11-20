const dayMonthYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Formats a date as "19 October 2026" (content dates are calendar days, read as UTC). */
export function formatDate(date: Date): string {
  return dayMonthYear.format(date);
}

/** Formats a date or a date range, e.g. "7–9 May 2025" or "30 September – 2 October 2025". */
export function formatDateRange(start: Date, end?: Date): string {
  if (!end || end.getTime() === start.getTime()) return formatDate(start);
  return dayMonthYear.formatRange(start, end);
}

/** Formats a month or a range of months, e.g. "February 2025" or "February – May 2025". */
export function formatMonthRange(start: Date, end?: Date): string {
  if (!end || isoDay(end).slice(0, 7) === isoDay(start).slice(0, 7)) return monthYear.format(start);
  return monthYear.formatRange(start, end);
}

/** ISO calendar day, e.g. "2026-10-19", for `<time datetime>`. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
