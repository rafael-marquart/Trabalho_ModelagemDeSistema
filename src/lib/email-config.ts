// SMTP settings read from the environment (SPEC-001). The same code talks to Mailpit in development and to a real
// provider (Gmail, Brevo, a company relay…) in homologation/production; only the variables change.

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;        // TLS from the first byte (usually port 465)
  requireTLS: boolean;    // refuse to send unless STARTTLS succeeds (usually port 587)
  auth?: { user: string; pass: string };
  from: string;
  fromAddress: string;
  timeouts: { connectionMs: number; greetingMs: number; socketMs: number };
};

export class EmailConfigError extends Error {
  constructor(readonly code: string, message: string) { super(message); this.name = "EmailConfigError"; }
}

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "mailpit"]);
const bool = (value: string | undefined) => value === undefined || value === "" ? undefined : value.trim().toLowerCase() === "true";
const ms = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** Address inside SMTP_FROM, which may be "Name <address>" or just the address. */
export function fromAddressOf(from: string): string | null {
  const address = (from.match(/<([^<>\s]+)>\s*$/)?.[1] ?? from).trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address) ? address : null;
}

export const isLocalSmtpHost = (host: string) => LOCAL_HOSTS.has(host.trim().toLowerCase());

/**
 * Validates the SMTP variables and fails with a clear code instead of letting the provider reject the message later.
 * In production a remote server must use TLS (implicit on 465, or STARTTLS required on other ports).
 */
export function readEmailConfig(env: Record<string, string | undefined> = process.env): EmailConfig {
  const host = env.SMTP_HOST?.trim();
  const from = env.SMTP_FROM?.trim();
  if (!host) throw new EmailConfigError("SMTP_HOST_MISSING", "Defina SMTP_HOST (servidor SMTP).");
  if (!from) throw new EmailConfigError("SMTP_FROM_MISSING", "Defina SMTP_FROM (remetente, por exemplo \"Acessa Vagas <nao-responda@seu-dominio>\").");
  const fromAddress = fromAddressOf(from);
  if (!fromAddress) throw new EmailConfigError("SMTP_FROM_INVALID", "SMTP_FROM não contém um endereço de e-mail válido.");

  const port = env.SMTP_PORT?.trim() ? Number(env.SMTP_PORT) : 587;
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new EmailConfigError("SMTP_PORT_INVALID", "SMTP_PORT deve ser um número de porta válido.");
  const secure = bool(env.SMTP_SECURE) ?? port === 465;
  const production = env.NODE_ENV === "production" || env.APP_ENV === "production";
  const local = isLocalSmtpHost(host);
  // STARTTLS is required by default for remote servers; Mailpit and other local capture servers run without TLS.
  const requireTLS = !secure && (bool(env.SMTP_REQUIRE_TLS) ?? !local);
  if (production && !local && !secure && !requireTLS) {
    throw new EmailConfigError("SMTP_INSECURE", "Em produção, o SMTP remoto deve usar TLS: SMTP_SECURE=\"true\" (porta 465) ou SMTP_REQUIRE_TLS=\"true\" (porta 587).");
  }

  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASSWORD ?? "";
  if (user && !pass) throw new EmailConfigError("SMTP_PASSWORD_MISSING", "SMTP_USER foi definido sem SMTP_PASSWORD.");

  return {
    host, port, secure, requireTLS, from, fromAddress,
    ...(user ? { auth: { user, pass } } : {}),
    timeouts: {
      connectionMs: ms(env.SMTP_CONNECTION_TIMEOUT_MS, 10_000),
      greetingMs: ms(env.SMTP_GREETING_TIMEOUT_MS, 10_000),
      socketMs: ms(env.SMTP_SOCKET_TIMEOUT_MS, 20_000)
    }
  };
}
