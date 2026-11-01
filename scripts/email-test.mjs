import nodemailer from "nodemailer";

// Checks the SMTP settings of .env and sends one test message (SPEC-001). Works with Mailpit and with a real provider.
// Usage: npm run email:test -- destinatario@exemplo.com
// Mirrors src/lib/email-config.ts (scripts run without the TypeScript build); keep both in sync.
try { process.loadEnvFile?.(".env"); } catch { /* no .env: use the variables already set */ }

const env = process.env;
const to = process.argv[2] || env.SMTP_TEST_TO || "teste@acessavagas.local";
const host = env.SMTP_HOST?.trim();
const from = env.SMTP_FROM?.trim();
const out = text => process.stdout.write(`${text}\n`);
const fail = text => { process.stderr.write(`ERRO: ${text}\n`); process.exitCode = 1; };

if (!host || !from) {
  fail("defina SMTP_HOST e SMTP_FROM no .env.");
} else {
  const port = env.SMTP_PORT?.trim() ? Number(env.SMTP_PORT) : 587;
  const local = ["127.0.0.1", "localhost", "::1", "mailpit"].includes(host.toLowerCase());
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE.trim().toLowerCase() === "true" : port === 465;
  const requireTLS = !secure && (env.SMTP_REQUIRE_TLS ? env.SMTP_REQUIRE_TLS.trim().toLowerCase() === "true" : !local);
  const user = env.SMTP_USER?.trim();
  out(`Servidor: ${host}:${port} · TLS ${secure ? "direto (SMTPS)" : requireTLS ? "obrigatório via STARTTLS" : "desligado (somente captura local)"}`);
  out(`Remetente: ${from} · Autenticação: ${user ? `usuário ${user}, senha ${env.SMTP_PASSWORD ? "definida" : "VAZIA"}` : "nenhuma"}`);
  out(`Destinatário do teste: ${to}`);
  const transporter = nodemailer.createTransport({
    host, port, secure, requireTLS, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    ...(user ? { auth: { user, pass: env.SMTP_PASSWORD || "" } } : {})
  });
  const explain = error => {
    const code = error?.code; const response = error?.responseCode;
    if (code === "EAUTH" || response === 535) return "o servidor recusou o usuário ou a senha (no Gmail, use uma senha de app).";
    if (code === "ETIMEDOUT") return "o servidor não respondeu a tempo (porta bloqueada ou host errado?).";
    if (code === "ETLS" || /tls|ssl|certificate|wrong version number/i.test(String(error?.message))) return "falha no TLS (confira SMTP_SECURE e a porta: 465 = SMTPS, 587 = STARTTLS).";
    if (["ECONNECTION", "ECONNREFUSED", "EDNS", "ESOCKET"].includes(code) || /ECONNREFUSED|ENOTFOUND|getaddrinfo/.test(String(error?.message))) return "não foi possível conectar (o Mailpit está rodando? host e porta corretos?).";
    if (response >= 400) return `o servidor recusou a mensagem (resposta ${response}). Confira se o remetente é permitido pelo provedor.`;
    return `erro inesperado (${code || error?.message || "sem código"}).`;
  };
  try {
    await transporter.verify();
    out("Conexão e autenticação: OK");
    const sentAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const info = await transporter.sendMail({
      from, to, subject: "Teste de envio — Acessa Vagas",
      text: `Esta é uma mensagem de teste do Acessa Vagas, enviada em ${sentAt}, para conferir a configuração de SMTP.`,
      html: `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Teste de envio</title></head><body><h1>Teste de envio</h1><p>Mensagem de teste do Acessa Vagas, enviada em ${sentAt}.</p></body></html>`,
      headers: { "Auto-Submitted": "auto-generated" }
    });
    out(`Mensagem aceita pelo servidor (${info.response || "sem resposta detalhada"}).`);
    out(local ? "Abra http://localhost:8025 para ver a mensagem no Mailpit." : "Confira a caixa de entrada (e o spam) do destinatário.");
  } catch (error) {
    fail(explain(error));
  }
}
