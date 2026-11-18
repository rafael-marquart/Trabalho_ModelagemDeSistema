const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Plain text of a source field: tags removed, common entities decoded, spaces collapsed. Nothing is added. */
export function plainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const number = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(number) && number > 0 && number < 0x110000 ? String.fromCodePoint(number) : " ";
      }
      return entities[code.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** Comparison key: lower case, no accents, only letters and digits separated by single spaces. */
export function comparisonKey(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export const letterCount = (value: string) => (value.normalize("NFD").match(/\p{L}/gu) ?? []).length;
export const wordCount = (value: string) => value.split(/\s+/).filter((word) => letterCount(word) > 0).length;

/** Whether the words of `needle` appear, in order and whole, in `haystack` (both compared by comparisonKey). */
export function appearsIn(needle: string, haystack: string): boolean {
  const target = comparisonKey(needle);
  if (!target) return false;
  return ` ${comparisonKey(haystack)} `.includes(` ${target} `);
}
