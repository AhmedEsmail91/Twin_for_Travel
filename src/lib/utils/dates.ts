/**
 * Date helpers.
 *
 * Dates are stored as UTC `Date` values. Trip *days* are calendar days in the
 * company's timezone, so comparisons use the day boundary in that zone rather than
 * the visitor's. Formatting is always `Intl` — never string arithmetic. CLAUDE.md §8.
 */

const MS_PER_DAY = 86_400_000;

/**
 * Start of the given instant's calendar day in `timeZone`, expressed as a UTC Date.
 * Used to compare "is this trip's start date today or later" consistently for a
 * visitor in Cairo and a visitor in London.
 */
export function startOfDayInZone(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const lookup = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '00';

  return new Date(`${lookup('year')}-${lookup('month')}-${lookup('day')}T00:00:00.000Z`);
}

/**
 * Inclusive day count between two dates — a trip that starts and ends on the same
 * day lasts one day, not zero.
 */
export function durationInDays(start: Date, end: Date, timeZone: string): number {
  const from = startOfDayInZone(start, timeZone).getTime();
  const to = startOfDayInZone(end, timeZone).getTime();
  return Math.max(1, Math.round((to - from) / MS_PER_DAY) + 1);
}

export function isSameDay(a: Date, b: Date, timeZone: string): boolean {
  return startOfDayInZone(a, timeZone).getTime() === startOfDayInZone(b, timeZone).getTime();
}

/** `yyyy-MM-dd` in the given zone — the value shape `<input type="date">` expects. */
export function toDateInputValue(date: Date | string | null | undefined, timeZone: string): string {
  if (!date) return '';
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return '';
  return startOfDayInZone(parsed, timeZone).toISOString().slice(0, 10);
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}
