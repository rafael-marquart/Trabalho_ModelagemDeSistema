// Accent- and case-insensitive text matching used to compare job criteria with declared candidate data.
export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9+#.\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** True when the criterion appears in the text as a whole word/phrase (so "java" does not match "javascript"). */
export function containsTerm(text: string, term: string): boolean {
  const haystack = ` ${normalizeText(text)} `;
  const needle = normalizeText(term);
  if (!needle) return false;
  return haystack.includes(` ${needle} `);
}
