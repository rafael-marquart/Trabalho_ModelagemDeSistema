import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn();
  return { sendMail, createTransport: vi.fn(() => ({ sendMail })) };
});
vi.mock("nodemailer", () => ({ default: { createTransport } }));
import { classifyEmailError, EmailDeliveryError, emailFailureMetadata, sendEmail } from "./email";
import { readEmailConfig } from "./email-config";
import { emailTemplates } from "./email-templates";

const base = { SMTP_HOST: "smtp.provedor.example", SMTP_FROM: "Acessa Vagas <nao-responda@acessavagas.example>" };

describe("SMTP configuration (SPEC-001)", () => {
  it("requires host and a valid sender", () => {
    expect(() => readEmailConfig({})).toThrow(/SMTP_HOST/);
    expect(() => readEmailConfig({ SMTP_HOST: "x" })).toThrow(/SMTP_FROM/);
    expect(() => readEmailConfig({ ...base, SMTP_FROM: "Acessa Vagas" })).toThrow(/endereço/);
    expect(() => readEmailConfig({ ...base, SMTP_USER: "conta" })).toThrow(/SMTP_PASSWORD/);
    expect(() => readEmailConfig({ ...base, SMTP_PORT: "abc" })).toThrow(/porta/);
  });

  it("uses implicit TLS on 465 and requires STARTTLS on remote servers", () => {
    expect(readEmailConfig({ ...base, SMTP_PORT: "465" })).toMatchObject({ secure: true, requireTLS: false });
    expect(readEmailConfig(base)).toMatchObject({ port: 587, secure: false, requireTLS: true, fromAddress: "nao-responda@acessavagas.example" });
    expect(readEmailConfig({ ...base, SMTP_HOST: "127.0.0.1", SMTP_PORT: "1025" })).toMatchObject({ secure: false, requireTLS: false });
  });

  it("refuses an unencrypted remote server in production", () => {
    expect(() => readEmailConfig({ ...base, NODE_ENV: "production", SMTP_REQUIRE_TLS: "false" })).toThrow(/TLS/);
    expect(readEmailConfig({ ...base, NODE_ENV: "production" }).requireTLS).toBe(true);
    expect(readEmailConfig({ ...base, SMTP_USER: "conta", SMTP_PASSWORD: "segredo" }).auth).toEqual({ user: "conta", pass: "segredo" });
  });
});

describe("delivery", () => {
  const env = { ...process.env };
  beforeEach(() => { vi.clearAllMocks(); Object.assign(process.env, base, { SMTP_PORT: "587" }); vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => { process.env = { ...env }; vi.restoreAllMocks(); });

  it("sends text and HTML with timeouts, STARTTLS and automatic-message headers", async () => {
    sendMail.mockResolvedValue({});
    await sendEmail({ to: "pessoa@example.com", ...emailTemplates.passwordRecovery("https://app.example/recuperar-senha?token=abc") });
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: "smtp.provedor.example", port: 587, requireTLS: true, connectionTimeout: 10000, socketTimeout: 20000 }));
    const message = sendMail.mock.calls[0][0];
    expect(message).toMatchObject({ from: base.SMTP_FROM, to: "pessoa@example.com", subject: "Recuperação de senha — Acessa Vagas", headers: { "Auto-Submitted": "auto-generated" } });
    expect(message.text).toContain("https://app.example/recuperar-senha?token=abc");
    expect(message.html).toContain('href="https://app.example/recuperar-senha?token=abc"');
  });

  it("classifies failures and never logs the recipient or the link", async () => {
    sendMail.mockRejectedValue(Object.assign(new Error("Invalid login: 535 5.7.8 for pessoa@example.com"), { code: "EAUTH", responseCode: 535 }));
    const failure = await sendEmail({ to: "pessoa@example.com", ...emailTemplates.passwordRecovery("https://app.example/x?token=segredo") }).catch((error) => error);
    expect(failure).toBeInstanceOf(EmailDeliveryError);
    expect(failure.kind).toBe("AUTH");
    const logged = JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).not.toMatch(/pessoa@example.com|segredo/);
    expect(emailFailureMetadata(failure)).toEqual({ reason: "AUTH", responseCode: 535 });
  });

  it("maps the usual SMTP errors to a category", () => {
    expect(classifyEmailError({ code: "ECONNECTION" }).kind).toBe("CONNECTION");
    expect(classifyEmailError({ code: "ETIMEDOUT" }).kind).toBe("TIMEOUT");
    expect(classifyEmailError({ code: "EENVELOPE", responseCode: 451 }).kind).toBe("REJECTED");
    expect(classifyEmailError({ responseCode: 550 }).kind).toBe("REJECTED");
    expect(classifyEmailError(new Error("x")).kind).toBe("UNKNOWN");
  });

  it("fails as CONFIG when SMTP is not configured, without calling the server", async () => {
    delete process.env.SMTP_HOST;
    await expect(sendEmail({ to: "a@b.c", subject: "s", text: "t" })).rejects.toMatchObject({ kind: "CONFIG" });
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("templates", () => {
  it("escape names in HTML and keep the same link in both versions", () => {
    const mail = emailTemplates.recruiterInvitation("<Loja & Cia>", "https://app.example/recrutador/convite?token=a&b=1");
    expect(mail.html).toContain("&lt;Loja &amp; Cia&gt;");
    expect(mail.html).not.toContain("<Loja");
    expect(mail.html).toContain('href="https://app.example/recrutador/convite?token=a&amp;b=1"');
    expect(mail.text).toContain("https://app.example/recrutador/convite?token=a&b=1");
    expect(mail.html).toContain('<html lang="pt-BR">');
    for (const content of [emailTemplates.companyEmailVerification("u"), emailTemplates.companyEmailVerificationResend("u"), emailTemplates.passwordRecovery("u")]) {
      expect(content.text).toContain("Mensagem automática do Acessa Vagas");
    }
  });
});
