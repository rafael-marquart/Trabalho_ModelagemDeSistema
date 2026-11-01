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
};

export type NotificationKind = "APPLICATION_SUBMITTED" | "APPLICATION_STAGE_CHANGED" | "APPLICATION_CANCELLED" | "JOB_CLOSED";

const OFFICIAL = "O e-mail é um aviso: a situação oficial é a que aparece na plataforma.";

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
        closing: [OFFICIAL]
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
        closing: [OFFICIAL]
      });
    }
    case "APPLICATION_CANCELLED": {
      const area = payload.recipientArea === "recrutador" ? "recrutador" : "empresa";
      return buildEmail({
        subject: `Candidatura cancelada pelo candidato: ${job} — Acessa Vagas`,
        heading: "Candidatura cancelada pelo candidato",
        intro: [`${payload.candidateName || "Um candidato"} cancelou a candidatura para ${job}. A candidatura e o histórico continuam registrados no funil, na etapa Cancelada.`],
        action: { label: "Ver candidatura", url: `${link.baseUrl}/${area}/vagas/${link.jobId ?? ""}/candidaturas/${link.applicationId ?? ""}` },
        closing: [OFFICIAL]
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
        closing: [OFFICIAL]
      });
  }
}
