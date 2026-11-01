// SPEC-001 e-mails: each message goes as plain text plus an accessible HTML version with the same content and link.
// No images or remote resources (many clients block them); one action link, also written out in full.

export type EmailContent = { subject: string; text: string; html: string };

type Message = {
  subject: string;
  heading: string;
  intro: string[];
  action: { label: string; url: string };
  validity: string;
  closing: string[];
};

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const FOOTER = "Mensagem automática do Acessa Vagas. Não responda a este e-mail.";

function render(message: Message): EmailContent {
  const text = [
    message.heading, "",
    ...message.intro.flatMap((line) => [line, ""]),
    `${message.action.label}: ${message.action.url}`, "",
    message.validity, "",
    ...message.closing.flatMap((line) => [line, ""]),
    "—", FOOTER
  ].join("\n");

  const url = escapeHtml(message.action.url);
  const paragraph = (line: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1d1530;">${escapeHtml(line)}</p>`;
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(message.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f0f8;">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(message.intro[0] ?? message.heading)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0f8;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #c9bcd9;border-radius:12px;">
<tr><td style="padding:24px 28px 8px;font-family:Arial,Helvetica,sans-serif;">
<p style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#4a1d8a;">Acessa Vagas</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1d1530;">${escapeHtml(message.heading)}</h1>
${message.intro.map(paragraph).join("\n")}
<p style="margin:24px 0;"><a href="${url}" style="display:inline-block;padding:14px 22px;border-radius:8px;background:#5b21b6;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">${escapeHtml(message.action.label)}</a></p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3d3450;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><a href="${url}" style="color:#4a1d8a;word-break:break-all;">${url}</a></p>
${paragraph(message.validity)}
${message.closing.map(paragraph).join("\n")}
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #e6dff0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#4b4060;">${escapeHtml(FOOTER)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return { subject: message.subject, text, html };
}

export const emailTemplates = {
  companyEmailVerification: (url: string) => render({
    subject: "Confirme o e-mail corporativo — Acessa Vagas",
    heading: "Confirme o e-mail corporativo",
    intro: ["Recebemos o cadastro de uma conta empresarial com este e-mail. A confirmação do e-mail ativa a conta empresarial."],
    action: { label: "Confirmar e-mail", url },
    validity: "O link vale por 24 horas e pode ser usado apenas uma vez.",
    closing: [
      "Se um CNPJ foi informado, o sistema verifica apenas o formato, sem consultar fonte externa.",
      "Se você não solicitou este cadastro, ignore esta mensagem."
    ]
  }),
  companyEmailVerificationResend: (url: string) => render({
    subject: "Novo link de confirmação — Acessa Vagas",
    heading: "Novo link de confirmação",
    intro: ["Você pediu um novo link para confirmar o e-mail corporativo. Os links enviados antes deixam de valer."],
    action: { label: "Confirmar e-mail", url },
    validity: "O link vale por 24 horas e pode ser usado apenas uma vez.",
    closing: ["Se você não solicitou este envio, ignore esta mensagem."]
  }),
  passwordRecovery: (url: string) => render({
    subject: "Recuperação de senha — Acessa Vagas",
    heading: "Recuperação de senha",
    intro: ["Recebemos uma solicitação de recuperação de senha para a sua conta."],
    action: { label: "Criar nova senha", url },
    validity: "O link vale por 30 minutos e pode ser usado apenas uma vez.",
    closing: ["Se você não solicitou, ignore esta mensagem. Sua senha atual continua valendo."]
  }),
  recruiterInvitation: (companyName: string, url: string) => render({
    subject: "Convite para se vincular a uma empresa — Acessa Vagas",
    heading: "Convite para recrutador",
    intro: [`A empresa ${companyName} convidou você para se vincular à organização como recrutador no Acessa Vagas.`],
    action: { label: "Ver convite", url },
    validity: "Aceite ou recuse em até 7 dias.",
    closing: [
      "Se você ainda não tem uma conta ativa, poderá definir sua senha antes de aceitar o vínculo.",
      "Se não esperava este convite, pode recusá-lo ou ignorar esta mensagem."
    ]
  }),
  smtpTest: (sentAt: string) => ({
    subject: "Teste de envio — Acessa Vagas",
    text: `Esta é uma mensagem de teste do Acessa Vagas, enviada em ${sentAt}, para conferir a configuração de SMTP.\n\n—\n${FOOTER}`,
    html: `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Teste de envio — Acessa Vagas</title></head><body style="font-family:Arial,Helvetica,sans-serif;color:#1d1530;"><h1 style="font-size:20px;">Teste de envio</h1><p>Esta é uma mensagem de teste do Acessa Vagas, enviada em ${escapeHtml(sentAt)}, para conferir a configuração de SMTP.</p><p style="font-size:13px;color:#4b4060;">${escapeHtml(FOOTER)}</p></body></html>`
  })
};
