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

// Connective and filler words recruiters often write around the actual skill ("ter cursado engenharia de software").
const FILLER_WORDS = new Set([
  "a", "o", "as", "os", "um", "uma", "de", "da", "do", "das", "dos", "e", "ou", "em", "no", "na", "nos", "nas", "com", "para", "por",
  "ter", "possuir", "saber", "cursado", "cursada", "cursando", "cursou", "formado", "formada", "formacao", "graduado", "graduada",
  "graduacao", "curso", "conhecimento", "conhecimentos", "experiencia", "experiencias", "dominio", "nocoes", "nocao", "boa", "bom",
  "basico", "basica", "solido", "solida", "desejavel", "obrigatorio", "obrigatoria"
]);

/** Significant words of a criterion, without connectives or filler. */
export function significantWords(term: string): string[] {
  return normalizeText(term).split(" ").filter((word) => word && !FILLER_WORDS.has(word));
}

/**
 * Deterministic criterion match: the whole phrase appears in the text, or every significant word of the criterion
 * appears in it as a whole word ("ter cursado engenharia de software" matches the course "Engenharia de Software").
 */
export function matchesCriterion(text: string, term: string): boolean {
  if (containsTerm(text, term)) return true;
  const words = significantWords(term);
  if (!words.length) return false;
  const haystack = ` ${normalizeText(text)} `;
  return words.every((word) => haystack.includes(` ${word} `));
}
