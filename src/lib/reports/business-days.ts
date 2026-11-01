// OPEN-080: target of 5 business days. Weekends are skipped (Brasília calendar); holidays are not considered.
export const REVIEW_TARGET_BUSINESS_DAYS = 5;

export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setTime(result.getTime() + 24 * 60 * 60 * 1000);
    const weekday = new Date(result.getTime() - 3 * 60 * 60 * 1000).getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return result;
}
