import { buildEmail, type EmailContent } from "@/lib/email-templates";
import { candidateStageLabels } from "@/lib/applications/stages";

// SPEC-017: content of each notification. Only what the recipient needs (OPEN-066, section 5.5): the job, the company,
// the new stage, and a link to the official state (T-017-06). Nothing about other candidates; no accessibility data.

export type NotificationPayload = {
  jobTitle?: string;
  companyName?: string;
  toStage?: string;
  candidateName?: string;
  recipientArea?: "empresa" | "recrutador";
  scheduledAt?: string;
  modality?: string;
  locationOrLink?: string;
  accessibilityResources?: string;
  reportId?: string;
  area?: "candidato" | "empresa" | "recrutador";
  statusLabel?: string;
  decisionLabel?: string;
  summary?: string;
  delayed?: boolean;
};

export type NotificationKind = "APPLICATION_SUBMITTED" | "APPLICATION_STAGE_CHANGED" | "APPLICATION_CANCELLED" | "JOB_CLOSED"
  | "INTERVIEW_SCHEDULED" | "INTERVIEW_UPDATED" | "INTERVIEW_CANCELLED"
  | "REPORT_STATUS_CHANGED" | "REPORT_INFO_REQUESTED" | "REPORT_CONCLUDED";

const reportHref = (payload: NotificationPayload) => payload.area === "candidato" ? `/candidato/denuncias/${payload.reportId ?? ""}` : `/${payload.area === "recrutador" ? "recrutador" : "empresa"}/denuncias`;
/** SPEC-019/020 notices: progress and result only; the company never learns who reported (OPEN-077/081). */
function reportNotice(kind: "REPORT_STATUS_CHANGED" | "REPORT_INFO_REQUESTED" | "REPORT_CONCLUDED", payload: NotificationPayload) {
  const job = payload.jobTitle || "a vaga";
  if (kind === "REPORT_INFO_REQUESTED") return { title: "Pedido de informações sobre uma denúncia", body: `A moderação da plataforma pede esclarecimentos sobre uma denúncia relacionada à vaga ${job}. Veja os pontos e responda em Denúncias.` };
  if (kind === "REPORT_CONCLUDED") {
    return payload.area === "candidato"
      ? { title: "Sua denúncia foi concluída", body: `Resultado da denúncia sobre ${job}: ${payload.decisionLabel ?? "concluída"}.${payload.summary ? ` ${payload.summary}` : ""}` }
      : { title: "Denúncia concluída", body: `A moderação concluiu a análise de uma denúncia sobre a vaga ${job}: ${payload.decisionLabel ?? "concluída"}. Veja a justificativa e as medidas em Denúncias.` };
  }
  return { title: `Sua denúncia: ${payload.statusLabel ?? "atualizada"}`, body: payload.delayed
    ? `A moderação pediu informações adicionais sobre a denúncia de ${job}. A análise pode levar mais tempo que o previsto.`
    : `A denúncia sobre ${job} está ${(payload.statusLabel ?? "atualizada").toLocaleLowerCase("pt-BR")}.` };
}

const interviewWhen = (iso?: string) => {
  if (!iso) return "data a confirmar";
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) => date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", ...options });
  return `${part({ weekday: "long" })}, ${part({ day: "2-digit", month: "2-digit", year: "numeric" })}, às ${part({ hour: "2-digit", minute: "2-digit" })} (horário de Brasília)`;
};
const interviewLines = (payload: NotificationPayload) => [
  `Quando: ${interviewWhen(payload.scheduledAt)}.`,
  `Modalidade: ${payload.modality === "ONLINE" ? "on-line" : "presencial"}. ${payload.modality === "ONLINE" ? "Link" : "Local"}: ${payload.locationOrLink || "a confirmar"}.`,
  ...(payload.accessibilityResources ? [`Recursos de acessibilidade previstos: ${payload.accessibilityResources}`] : [])
];
const interviewHeading = { INTERVIEW_SCHEDULED: "Entrevista agendada", INTERVIEW_UPDATED: "Entrevista alterada", INTERVIEW_CANCELLED: "Entrevista cancelada" } as const;

const OFFICIAL = "O e-mail é um aviso: a situação oficial é a que aparece na plataforma.";
const OPT_OUT = "Este aviso também fica em Notificações, na plataforma, onde você pode desligar o envio por e-mail.";

export function notificationEmail(kind: NotificationKind, payload: NotificationPayload, link: { baseUrl: string; applicationId?: string | null; jobId?: string | null }): EmailContent {
  const job = payload.jobTitle || "a vaga";
  const company = payload.companyName || "a empresa";
  const tracking = `${link.baseUrl}/candidato/candidaturas/${link.applicationId ?? ""}`;
  switch (kind) {
    case "APPLICATION_SUBMITTED":
      return buildEmail({
        subject: `Candidatura registrada: ${job} — Acessa Vagas`,
        heading: "Candidatura registrada",
        intro: [`Sua candidatura para ${job}, em ${company}, foi registrada e está na etapa Inscrita.`],
        action: { label: "Acompanhar candidatura", url: tracking },
        closing: [OFFICIAL, OPT_OUT]
      });
    case "APPLICATION_STAGE_CHANGED": {
      const stage = candidateStageLabels[payload.toStage ?? ""] ?? "atualizada";
      const sentence = payload.toStage === "RECUSADA"
        ? `A empresa ${company} encerrou a sua participação no processo seletivo de ${job}.`
        : payload.toStage === "CONTRATADO"
          ? `A empresa ${company} registrou a aprovação da sua candidatura para ${job}.`
          : `Sua candidatura para ${job}, em ${company}, avançou para a etapa ${stage}.`;
      return buildEmail({
        subject: `Sua candidatura mudou: ${stage} — Acessa Vagas`,
        heading: `Situação da candidatura: ${stage}`,
        intro: [sentence],
        action: { label: "Ver detalhes da candidatura", url: tracking },
        closing: [OFFICIAL, OPT_OUT]
      });
    }
    case "APPLICATION_CANCELLED": {
      const area = payload.recipientArea === "recrutador" ? "recrutador" : "empresa";
      return buildEmail({
        subject: `Candidatura cancelada pelo candidato: ${job} — Acessa Vagas`,
        heading: "Candidatura cancelada pelo candidato",
        intro: [`${payload.candidateName || "Um candidato"} cancelou a candidatura para ${job}. A candidatura e o histórico continuam registrados no funil, na etapa Cancelada.`],
        action: { label: "Ver candidatura", url: `${link.baseUrl}/${area}/vagas/${link.jobId ?? ""}/candidaturas/${link.applicationId ?? ""}` },
        closing: [OFFICIAL, OPT_OUT]
      });
    }
    case "INTERVIEW_SCHEDULED":
    case "INTERVIEW_UPDATED":
    case "INTERVIEW_CANCELLED":
      return buildEmail({
        subject: `${interviewHeading[kind]}: ${job} — Acessa Vagas`,
        heading: interviewHeading[kind],
        intro: kind === "INTERVIEW_CANCELLED"
          ? [`${company} cancelou a entrevista de ${job} que estava marcada para ${interviewWhen(payload.scheduledAt)}. Sua candidatura continua no processo seletivo.`]
          : [kind === "INTERVIEW_SCHEDULED" ? `${company} agendou uma entrevista para a sua candidatura a ${job}.` : `${company} alterou a entrevista da sua candidatura a ${job}. Valem os dados abaixo.`, ...interviewLines(payload)],
        action: { label: "Ver detalhes da candidatura", url: tracking },
        closing: [OFFICIAL, OPT_OUT]
      });
    case "REPORT_STATUS_CHANGED":
    case "REPORT_INFO_REQUESTED":
    case "REPORT_CONCLUDED": {
      const notice = reportNotice(kind, payload);
      return buildEmail({
        subject: `${notice.title} — Acessa Vagas`, heading: notice.title, intro: [notice.body],
        action: { label: "Ver na plataforma", url: `${link.baseUrl}${reportHref(payload)}` },
        closing: [OPT_OUT]
      });
    }
    case "JOB_CLOSED":
      return buildEmail({
        subject: `Vaga encerrada: ${job} — Acessa Vagas`,
        heading: "A vaga foi encerrada",
        intro: [
          `A empresa ${company} encerrou a vaga ${job}, que não receberá novas candidaturas.`,
          "Sua candidatura continua registrada e não foi excluída por causa do encerramento. O processo seletivo pode continuar."
        ],
        action: { label: "Acompanhar candidatura", url: tracking },
        closing: [OFFICIAL, OPT_OUT]
      });
  }
}

/** Short version shown in the site's "Notificações" list, with a link inside the site to the official state. */
export function notificationSummary(kind: NotificationKind, payload: NotificationPayload, ids: { applicationId?: string | null; jobId?: string | null }): { title: string; body: string; href: string } {
  const job = payload.jobTitle || "a vaga";
  const company = payload.companyName || "a empresa";
  const tracking = `/candidato/candidaturas/${ids.applicationId ?? ""}`;
  switch (kind) {
    case "APPLICATION_SUBMITTED":
      return { title: "Candidatura registrada", body: `Sua candidatura para ${job}, em ${company}, foi registrada na etapa Inscrita.`, href: tracking };
    case "APPLICATION_STAGE_CHANGED": {
      const stage = candidateStageLabels[payload.toStage ?? ""] ?? "atualizada";
      const body = payload.toStage === "RECUSADA" ? `${company} encerrou a sua participação no processo seletivo de ${job}.`
        : payload.toStage === "CONTRATADO" ? `${company} registrou a aprovação da sua candidatura para ${job}.`
        : `Sua candidatura para ${job}, em ${company}, avançou para a etapa ${stage}.`;
      const title = payload.toStage === "RECUSADA" ? "Candidatura recusada" : payload.toStage === "CONTRATADO" ? "Candidatura aprovada" : `Nova etapa: ${stage}`;
      return { title, body, href: tracking };
    }
    case "APPLICATION_CANCELLED": {
      const area = payload.recipientArea === "recrutador" ? "recrutador" : "empresa";
      return { title: "Candidatura cancelada pelo candidato", body: `${payload.candidateName || "Um candidato"} cancelou a candidatura para ${job}.`, href: `/${area}/vagas/${ids.jobId ?? ""}/candidaturas/${ids.applicationId ?? ""}` };
    }
    case "INTERVIEW_SCHEDULED":
    case "INTERVIEW_UPDATED":
      return { title: interviewHeading[kind], body: `${company}, ${job}: ${interviewWhen(payload.scheduledAt)}, ${payload.modality === "ONLINE" ? "on-line" : "presencial"}.`, href: tracking };
    case "INTERVIEW_CANCELLED":
      return { title: "Entrevista cancelada", body: `${company} cancelou a entrevista de ${job} marcada para ${interviewWhen(payload.scheduledAt)}.`, href: tracking };
    case "REPORT_STATUS_CHANGED":
    case "REPORT_INFO_REQUESTED":
    case "REPORT_CONCLUDED":
      return { ...reportNotice(kind, payload), href: reportHref(payload) };
    case "JOB_CLOSED":
      return { title: "Vaga encerrada", body: `${company} encerrou a vaga ${job}. Sua candidatura continua registrada e o processo seletivo pode continuar.`, href: tracking };
  }
}
