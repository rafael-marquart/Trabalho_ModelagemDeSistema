import nodemailer, { type Transporter } from "nodemailer";
import { EmailConfigError, readEmailConfig, type EmailConfig } from "./email-config";

export type EmailFailureKind = "CONFIG" | "AUTH" | "CONNECTION" | "TIMEOUT" | "TLS" | "REJECTED" | "UNKNOWN";

/** A delivery failure with a category safe to log and audit: no recipient, link or token is ever included. */
export class EmailDeliveryError extends Error {
  constructor(readonly kind: EmailFailureKind, readonly code: string | undefined, readonly responseCode: number | undefined) {
    super(`EMAIL_${kind}`);
    this.name = "EmailDeliveryError";
  }
}

type SmtpError = { code?: string; responseCode?: number; command?: string };

export function classifyEmailError(error: unknown): EmailDeliveryError {
  if (error instanceof EmailDeliveryError) return error;
  if (error instanceof EmailConfigError) return new EmailDeliveryError("CONFIG", error.code, undefined);
  const { code, responseCode, command } = (typeof error === "object" && error !== null ? error : {}) as SmtpError;
  let kind: EmailFailureKind = "UNKNOWN";
  if (code === "EAUTH" || command === "AUTH PLAIN" || command === "AUTH LOGIN" || responseCode === 535) kind = "AUTH";
  else if (code === "ETIMEDOUT" || code === "ETIMEOUT") kind = "TIMEOUT";
  else if (code === "ETLS" || (code === "ESOCKET" && /tls|ssl|certificate/i.test(String((error as Error)?.message)))) kind = "TLS";
  else if (code === "ECONNECTION" || code === "ECONNREFUSED" || code === "EDNS" || code === "ESOCKET") kind = "CONNECTION";
  else if (code === "EENVELOPE" || code === "EMESSAGE" || (responseCode && responseCode >= 400)) kind = "REJECTED";
  return new EmailDeliveryError(kind, code, responseCode);
}

const explanations: Record<EmailFailureKind, string> = {
  CONFIG: "configuração de SMTP ausente ou inválida",
  AUTH: "o servidor SMTP recusou o usuário ou a senha",
  CONNECTION: "não foi possível conectar ao servidor SMTP",
  TIMEOUT: "o servidor SMTP não respondeu a tempo",
  TLS: "falha na conexão segura (TLS) com o servidor SMTP",
  REJECTED: "o servidor SMTP recusou o remetente, o destinatário ou a mensagem",
  UNKNOWN: "erro inesperado no envio"
};
export const explainEmailFailure = (error: EmailDeliveryError) =>
  `${explanations[error.kind]}${error.responseCode ? ` (resposta ${error.responseCode})` : error.code ? ` (${error.code})` : ""}`;

let cached: { key: string; transporter: Transporter } | null = null;

function transporterFor(config: EmailConfig) {
  const key = JSON.stringify([config.host, config.port, config.secure, config.requireTLS, config.auth?.user, config.auth?.pass, config.timeouts]);
  if (cached?.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: config.host, port: config.port, secure: config.secure, requireTLS: config.requireTLS,
    connectionTimeout: config.timeouts.connectionMs, greetingTimeout: config.timeouts.greetingMs, socketTimeout: config.timeouts.socketMs,
    ...(config.auth ? { auth: config.auth } : {})
  });
  cached = { key, transporter };
  return transporter;
}

/**
 * Sends one e-mail through the configured SMTP server (Mailpit locally, a real provider elsewhere). Any failure is
 * thrown as EmailDeliveryError and logged on the server with its category only; callers keep their own fallback
 * (audit entry, generic public message, token cleanup).
 */
export async function sendEmail(input: { to: string; subject: string; text: string; html?: string }) {
  try {
    const config = readEmailConfig();
    await transporterFor(config).sendMail({
      from: config.from, to: input.to, subject: input.subject, text: input.text,
      ...(input.html ? { html: input.html } : {}),
      headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" }
    });
  } catch (error) {
    const failure = classifyEmailError(error);
    console.error(`[e-mail] envio falhou: ${explainEmailFailure(failure)}`);
    throw failure;
  }
}

/** Audit metadata for a failed delivery: the category only. */
export const emailFailureMetadata = (error: unknown) => {
  const failure = classifyEmailError(error);
  return { reason: failure.kind, ...(failure.responseCode ? { responseCode: failure.responseCode } : {}) };
};
