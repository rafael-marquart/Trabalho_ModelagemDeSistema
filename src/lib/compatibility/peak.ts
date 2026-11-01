// Travel times use a fixed reference trip instead of "now" (decision of 29/10/2026): leaving at 07:00 (Brasília time)
// on the next Tuesday, a typical morning peak on a working day. A check at 2 a.m. therefore gives the same answer.
export const PEAK_POLICY = "dia-util-07h";
export const PEAK_LABEL = "saindo às 7h em dia útil";

/** ISO departure time of the next Tuesday at 07:00 in Brasília (UTC-03:00), strictly after `now`. */
export function nextPeakDeparture(now: Date = new Date()): string {
  const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const day = brasilia.getUTCDay();
  let ahead = (2 - day + 7) % 7;
  if (ahead === 0 && brasilia.getUTCHours() >= 7) ahead = 7;
  const date = new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate() + ahead));
  return `${date.toISOString().slice(0, 10)}T07:00:00-03:00`;
}
