// SPEC-010 (OPEN-043/044/045/046): pure presentation rules for the job detail. No score is computed here.
export type Availability = { code: "OPEN" | "UNAVAILABLE" | "CLOSED"; label: string; message: string };

const formatDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

/** Current availability from the stored status and deadline (labels follow the SPEC-009 catalog: aberta, indisponível, encerrada). */
export function availabilityOf(status: string, deadline: string, today: string): Availability {
  if (status === "CLOSED") return { code: "CLOSED", label: "Encerrada", message: "Esta vaga foi encerrada e não recebe candidaturas." };
  if (status === "PAUSED") return { code: "UNAVAILABLE", label: "Indisponível", message: "A empresa pausou esta vaga. Candidaturas estão temporariamente bloqueadas." };
  if (deadline && deadline < today) return { code: "UNAVAILABLE", label: "Indisponível", message: `O prazo de inscrição terminou em ${formatDate(deadline)}.` };
  return { code: "OPEN", label: "Aberta", message: deadline ? `Inscrições abertas até ${formatDate(deadline)}.` : "Inscrições abertas." };
}

type CompatibilitySummary = {
  status: "COMPLETE" | "INSUFFICIENT_DATA" | "INCOMPATIBLE"; score?: number | null;
  critical?: { pending?: { needName: string }[] }; missing?: { responsible?: string }[];
} | null;
export type ExistingApplication = { appliedAt: string; stageLabel: string } | null;
export type ActionDecision = { allowed: boolean; applied?: boolean; message: string };

const dateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Whether the candidate may move on to apply. Status and critical barriers govern it; the final check belongs to SPEC-011.
 */
export function decideAction(availability: Availability, compatibility: CompatibilitySummary, existing: ExistingApplication = null): ActionDecision {
  if (existing) return { allowed: false, applied: true, message: `Você se candidatou em ${dateTime(existing.appliedAt).replace(", ", " às ")}. Etapa atual: ${existing.stageLabel}.` };
  if (availability.code !== "OPEN") return { allowed: false, message: availability.message };
  if (!compatibility) return { allowed: false, message: "Não foi possível verificar a sua elegibilidade agora. Tente novamente em instantes." };
  if (compatibility.status === "INCOMPATIBLE") {
    return { allowed: false, message: "Esta vaga não é elegível para você: ela declara não ter um recurso que você marcou como indispensável." };
  }
  // Only a critical barrier prevents applying (decision of 31/10/2026); missing data is explained, not blocking.
  const pending = compatibility.critical?.pending ?? [];
  if (pending.length) {
    return { allowed: true, message: `Você pode se candidatar, mas a elegibilidade não foi concluída: a vaga não informou se oferece ${pending.map((item) => item.needName.toLocaleLowerCase("pt-BR")).join(", ")}, que você marcou como indispensável.` };
  }
  if (compatibility.status !== "COMPLETE" || compatibility.score === null || compatibility.score === undefined) {
    const fromProfile = (compatibility.missing ?? []).some((item) => item.responsible === "CANDIDATE");
    return { allowed: true, message: fromProfile
      ? "Você pode se candidatar. O score de compatibilidade ainda não foi calculado porque faltam dados no seu perfil; completá-lo ajuda a empresa a entender a compatibilidade."
      : "Você pode se candidatar. O score de compatibilidade ainda não foi calculado porque a empresa não informou todos os dados da vaga." };
  }
  return { allowed: true, message: "Você atende às condições indispensáveis desta vaga e pode se candidatar." };
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Salary as registered; absence never means "no pay" (OPEN-045). */
export function salaryText(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return min === max ? currency.format(min) : `${currency.format(min)} a ${currency.format(max)}`;
  if (min !== null) return `A partir de ${currency.format(min)}`;
  if (max !== null) return `Até ${currency.format(max)}`;
  return "Não informada";
}

/** Location as registered; absence never means remote (OPEN-045). */
export function locationText(city: string, state: string, address: string): string {
  const place = [city.trim(), state.trim()].filter(Boolean).join("/");
  if (!place && !address.trim()) return "Não informada";
  return [address.trim(), place].filter(Boolean).join(", ");
}

export { formatDate };
