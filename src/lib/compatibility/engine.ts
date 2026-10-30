import { infrastructureItems } from "@/lib/company-infrastructure/items";
import { hasCriteria } from "@/lib/jobs/criteria";
import {
  DISPLACEMENT_WEIGHTS, NEED_TO_JOB_ITEM, TECHNICAL_WEIGHTS, WEIGHTS, dimensionLabels, educationRank, languageRank, travelBandScore
} from "./constants";
import { matchesCriterion, normalizeText } from "./text";
import type { AnalysisInput, AnalysisOutcome, Barrier, CandidateInput, Component, Dimension, DimensionCode, JobInput, MissingItem } from "./types";

const itemLabel = (code: string) => infrastructureItems.find((item) => item.code === code)?.label ?? code;

/** Whether the travel component applies: only on-site or hybrid jobs (remote jobs never penalize displacement). */
export const travelRequired = (job: Pick<JobInput, "modality">) => job.modality === "PRESENCIAL" || job.modality === "HIBRIDO";

/** Critical lock (RB-02/RB-15): a mandatory need meeting a declared barrier makes the job incompatible, whatever the score. */
export function evaluateCriticalLock(candidate: CandidateInput, job: JobInput): Barrier[] {
  const barriers: Barrier[] = [];
  for (const need of candidate.needs) {
    const jobItem = NEED_TO_JOB_ITEM[need.code];
    if (need.mandatory && jobItem && job.accessibility[jobItem] === "ABSENT") {
      barriers.push({ needCode: need.code, needName: need.name, jobItem });
    }
  }
  return barriers;
}

/** Indispensable needs that cannot be checked because the job left the matching resource "not informed". */
export function pendingCriticalChecks(candidate: CandidateInput, job: JobInput): Barrier[] {
  return candidate.needs
    .filter((need) => need.mandatory && NEED_TO_JOB_ITEM[need.code] && (job.accessibility[NEED_TO_JOB_ITEM[need.code]] ?? "NOT_INFORMED") === "NOT_INFORMED")
    .map((need) => ({ needCode: need.code, needName: need.name, jobItem: NEED_TO_JOB_ITEM[need.code] }));
}

function dimensionAccessibility(candidate: CandidateInput, job: JobInput, missing: MissingItem[], factors: string[]): Dimension {
  if (candidate.accessibilityDeclaration === "NOT_INFORMED") {
    missing.push({ dimension: "A", item: "Declaração de necessidades de acessibilidade", action: "Complete a seção de acessibilidade do seu perfil (inclusive se não tiver necessidades)." });
    return { status: "INSUFFICIENT", score: null, components: [] };
  }
  if (candidate.needs.length === 0) {
    factors.push(candidate.hasFreeTextNeeds
      ? "As necessidades descritas em texto livre não entram no cálculo; nenhuma opção do catálogo foi declarada."
      : "O candidato declarou não ter necessidades de acessibilidade; a dimensão de acessibilidade não se aplica.");
    return { status: "NOT_APPLICABLE", score: null, components: [] };
  }
  const components: Component[] = [];
  let evaluable = true;
  for (const need of candidate.needs) {
    const jobItem = NEED_TO_JOB_ITEM[need.code];
    if (!jobItem) {
      missing.push({ dimension: "A", item: `${need.name}: a vaga não tem como declarar este recurso`, action: "Sem ação do candidato; depende de a plataforma passar a declarar esse recurso nas vagas." });
      components.push({ label: need.name, score: null, detail: "Não avaliável: sem declaração correspondente na vaga." });
      evaluable = false;
      continue;
    }
    const status = job.accessibility[jobItem];
    if (status === "PRESENT") components.push({ label: need.name, score: 100, detail: `A vaga declara: ${itemLabel(jobItem).toLocaleLowerCase("pt-BR")} presente.` });
    else if (status === "ABSENT") components.push({ label: need.name, score: 0, detail: `A vaga declara: ${itemLabel(jobItem).toLocaleLowerCase("pt-BR")} ausente.` });
    else {
      missing.push({ dimension: "A", item: `${need.name}: a vaga não informou ${itemLabel(jobItem).toLocaleLowerCase("pt-BR")}`, action: "A empresa precisa informar este item na vaga." });
      components.push({ label: need.name, score: null, detail: "Não informado pela vaga." });
      evaluable = false;
    }
  }
  if (candidate.hasFreeTextNeeds) factors.push("As necessidades descritas em texto livre não entram no cálculo.");
  if (!evaluable) return { status: "INSUFFICIENT", score: null, components };
  const score = components.reduce((sum, component) => sum + (component.score ?? 0), 0) / components.length;
  return { status: "EVALUATED", score, components };
}

function candidateCorpus(candidate: CandidateInput): string[] {
  return [
    ...candidate.education.map((entry) => entry.course),
    ...candidate.courses, ...candidate.certifications, ...candidate.skills,
    ...candidate.experience.map((entry) => entry.role)
  ].filter((text) => text.trim().length > 0);
}

function dimensionTechnical(candidate: CandidateInput, job: JobInput, missing: MissingItem[], factors: string[]): Dimension {
  const criteria = job.criteria;
  if (!hasCriteria(criteria)) {
    factors.push("A vaga não define critérios técnicos; a dimensão de perfil técnico não se aplica.");
    return { status: "NOT_APPLICABLE", score: null, components: [] };
  }
  const parts: { weight: number; component: Component }[] = [];
  let insufficient = false;
  const lack = (item: string, action: string) => { missing.push({ dimension: "T", item, action }); insufficient = true; };

  if (criteria.skills.length) {
    const corpus = candidateCorpus(candidate);
    if (!corpus.length) {
      lack("Competências e conhecimentos (cursos, certificações, formação ou experiências)", "Informe formação, cursos, certificações ou experiências no seu perfil.");
    } else {
      const matched = criteria.skills.filter((skill) => corpus.some((entry) => matchesCriterion(entry, skill)));
      parts.push({ weight: TECHNICAL_WEIGHTS.skills, component: {
        label: "Competências e conhecimentos", score: (matched.length / criteria.skills.length) * 100,
        detail: `${matched.length} de ${criteria.skills.length} exigidas encontradas no perfil${matched.length ? `: ${matched.join(", ")}` : ""}.`
      } });
    }
  }
  if (criteria.experience.length) {
    if (!candidate.experience.length) lack("Experiência profissional", "Informe suas experiências profissionais no perfil.");
    else {
      const text = candidate.experience.map((entry) => `${entry.role} ${entry.company}`);
      const matched = criteria.experience.filter((term) => text.some((entry) => matchesCriterion(entry, term)));
      parts.push({ weight: TECHNICAL_WEIGHTS.experience, component: {
        label: "Experiência profissional", score: (matched.length / criteria.experience.length) * 100,
        detail: `${matched.length} de ${criteria.experience.length} experiências exigidas encontradas${matched.length ? `: ${matched.join(", ")}` : ""}.`
      } });
    }
  }
  if (criteria.educationMinLevel) {
    const required = educationRank[criteria.educationMinLevel];
    const completed = candidate.education.filter((entry) => entry.status === "Concluído" && educationRank[entry.level]);
    const anyRanked = candidate.education.some((entry) => educationRank[entry.level]);
    if (!anyRanked) lack("Formação e escolaridade", "Informe sua formação (nível e situação) no perfil.");
    else {
      const best = completed.reduce((max, entry) => Math.max(max, educationRank[entry.level]), 0);
      const score = best >= required ? 100 : best === required - 1 ? 50 : 0;
      parts.push({ weight: TECHNICAL_WEIGHTS.education, component: {
        label: "Formação e escolaridade", score,
        detail: best >= required ? `Atende o nível mínimo exigido (${criteria.educationMinLevel}).` : best === required - 1 ? `Um nível abaixo do mínimo exigido (${criteria.educationMinLevel}).` : `Abaixo do mínimo exigido (${criteria.educationMinLevel}) entre as formações concluídas.`
      } });
    }
  }
  if (criteria.languages.length) {
    if (!candidate.languages.length) lack("Idiomas", "Informe seus idiomas e níveis no perfil.");
    else {
      const scores: number[] = [];
      const details: string[] = [];
      let unknownLevel = false;
      for (const required of criteria.languages) {
        const found = candidate.languages.find((entry) => normalizeText(entry.language) === normalizeText(required.language));
        if (!found) { scores.push(0); details.push(`${required.language}: não declarado`); continue; }
        if (!found.level) { unknownLevel = true; lack(`Nível de ${required.language}`, `Informe o nível de ${required.language} no perfil.`); continue; }
        const have = languageRank[found.level], need = languageRank[required.level];
        scores.push(have >= need ? 100 : have === need - 1 ? 50 : 0);
        details.push(have >= need ? `${required.language}: atende (${found.level}; mínimo exigido ${required.level})`
          : `${required.language}: ${found.level}, abaixo do mínimo exigido (${required.level})`);
      }
      if (!unknownLevel) parts.push({ weight: TECHNICAL_WEIGHTS.languages, component: {
        label: "Idiomas", score: scores.reduce((a, b) => a + b, 0) / scores.length, detail: details.join("; ") + "."
      } });
    }
  }
  const components = parts.map((part) => part.component);
  if (insufficient) return { status: "INSUFFICIENT", score: null, components };
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const score = parts.reduce((sum, part) => sum + (part.component.score ?? 0) * part.weight, 0) / totalWeight;
  return { status: "EVALUATED", score, components };
}

function modalityScore(preferences: string[], jobModality: string): { score: number; detail: string } {
  const wanted = jobModality === "PRESENCIAL" ? "Presencial" : jobModality === "HIBRIDO" ? "Híbrido" : "Remoto";
  if (preferences.includes(wanted)) return { score: 100, detail: `A modalidade ${wanted.toLocaleLowerCase("pt-BR")} está entre as preferências do candidato.` };
  if (preferences.includes("Híbrido") || (wanted === "Híbrido" && preferences.length > 0)) {
    return { score: 50, detail: `A modalidade ${wanted.toLocaleLowerCase("pt-BR")} atende parcialmente as preferências do candidato.` };
  }
  return { score: 0, detail: `A modalidade ${wanted.toLocaleLowerCase("pt-BR")} não está entre as preferências do candidato.` };
}

function dimensionDisplacement(candidate: CandidateInput, job: JobInput, travel: AnalysisInput["travel"], missing: MissingItem[]): Dimension {
  const components: Component[] = [];
  let insufficient = false;
  const preferences = candidate.workPreferences.modalities;
  if (!job.modality) { missing.push({ dimension: "D", item: "Modalidade da vaga", action: "A empresa precisa informar a modalidade da vaga." }); insufficient = true; }
  else if (!preferences.length) { missing.push({ dimension: "D", item: "Preferência de modalidade de trabalho", action: "Informe suas preferências de trabalho no perfil." }); insufficient = true; }
  let modality: number | null = null;
  if (!insufficient) {
    const result = modalityScore(preferences, job.modality);
    modality = result.score;
    components.push({ label: "Modalidade", score: result.score, detail: result.detail });
  }
  if (!travelRequired(job)) {
    if (insufficient) return { status: "INSUFFICIENT", score: null, components };
    components.push({ label: "Deslocamento", score: null, detail: "Vaga totalmente remota: deslocamento não se aplica." });
    return { status: "EVALUATED", score: modality, components };
  }
  if (travel.status === "OK") {
    const band = travelBandScore(travel.minutes);
    components.push({ label: "Deslocamento", score: band, detail: `Tempo estimado de ${travel.minutes < 1 ? "menos de 1 min" : `cerca de ${Math.round(travel.minutes)} min`} (${travel.mode.toLocaleLowerCase("pt-BR")}${travel.departure ? `, ${travel.departure}` : ""}).` });
    if (insufficient) return { status: "INSUFFICIENT", score: null, components };
    return { status: "EVALUATED", score: DISPLACEMENT_WEIGHTS.modality * (modality ?? 0) + DISPLACEMENT_WEIGHTS.travel * band, components };
  }
  const reason = travel.status === "UNAVAILABLE" ? travel.reason : "Deslocamento não estimado.";
  missing.push({ dimension: "D", item: `Tempo de deslocamento: ${reason}`, action: "Confira o endereço e o meio de transporte no perfil e o endereço da vaga; tente novamente." });
  components.push({ label: "Deslocamento", score: null, detail: reason });
  return { status: "INSUFFICIENT", score: null, components };
}

/** Round to the nearest integer, exact halves going up (SPEC-007 rule 12). */
export function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5 + 1e-9);
}

/** Pure, deterministic analysis (RNF-10/RNF-15): the same inputs always give the same outcome. */
export function analyze(input: AnalysisInput): AnalysisOutcome {
  const { candidate, job, travel } = input;
  const missing: MissingItem[] = [];
  const factors: string[] = [];
  const barriers = evaluateCriticalLock(candidate, job);
  const pending = pendingCriticalChecks(candidate, job);

  const A = dimensionAccessibility(candidate, job, missing, factors);
  const T = dimensionTechnical(candidate, job, missing, factors);
  const D = dimensionDisplacement(candidate, job, travel, missing);
  const dimensions = { A, T, D };

  if (barriers.length) {
    for (const barrier of barriers) {
      factors.unshift(`Barreira incompatível: a necessidade obrigatória "${barrier.needName}" encontra "${itemLabel(barrier.jobItem).toLocaleLowerCase("pt-BR")}" declarado como ausente na vaga.`);
    }
    return { status: "INCOMPATIBLE", score: null, critical: { applied: true, barriers, pending }, dimensions, appliedWeights: null, missing, factors };
  }

  const codes: DimensionCode[] = ["A", "T", "D"];
  if (codes.some((code) => dimensions[code].status === "INSUFFICIENT")) {
    const insufficient = codes.filter((code) => dimensions[code].status === "INSUFFICIENT").map((code) => dimensionLabels[code]);
    factors.unshift(`Dados insuficientes em: ${insufficient.join(", ")}. O score final não é apresentado como completo.`);
    return { status: "INSUFFICIENT_DATA", score: null, critical: { applied: false, barriers: [], pending }, dimensions, appliedWeights: null, missing, factors };
  }

  // Dimensions with no applicable criterion are left out and the remaining weights are normalized (same rule used inside T and D).
  const applicable = codes.filter((code) => dimensions[code].status === "EVALUATED");
  const totalWeight = applicable.reduce((sum, code) => sum + WEIGHTS[code], 0);
  if (!applicable.length) {
    factors.unshift("Nenhuma dimensão aplicável para calcular o score.");
    return { status: "INSUFFICIENT_DATA", score: null, critical: { applied: false, barriers: [] }, dimensions, appliedWeights: null, missing, factors };
  }
  const appliedWeights: Partial<Record<DimensionCode, number>> = {};
  let sum = 0;
  for (const code of applicable) {
    appliedWeights[code] = WEIGHTS[code] / totalWeight;
    sum += (dimensions[code].score ?? 0) * WEIGHTS[code];
  }
  const score = roundHalfUp(sum / totalWeight);
  for (const code of codes) {
    const dim = dimensions[code];
    if (dim.status === "EVALUATED") factors.unshift(`${dimensionLabels[code]}: ${Math.round(dim.score ?? 0)}/100 (peso ${Math.round((appliedWeights[code] ?? 0) * 100)}%).`);
  }
  if (applicable.length < codes.length) factors.push("Dimensões não aplicáveis foram excluídas e os pesos das demais, normalizados proporcionalmente.");
  return { status: "COMPLETE", score, critical: { applied: false, barriers: [] }, dimensions, appliedWeights, missing, factors };
}
