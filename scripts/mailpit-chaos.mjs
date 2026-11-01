// Turns Mailpit's simulated SMTP failures on and off, to test how the app behaves when e-mail delivery fails.
// Requires Mailpit started with chaos enabled (compose.yaml sets MP_ENABLE_CHAOS).
// Usage:
//   npm run mailpit:chaos -- status
//   npm run mailpit:chaos -- off
//   npm run mailpit:chaos -- destinatario [codigo=451] [probabilidade=100]
//   npm run mailpit:chaos -- remetente [codigo=451] [probabilidade=100]
//   npm run mailpit:chaos -- autenticacao [codigo=535] [probabilidade=100]   (só falha se SMTP_USER estiver definido)
const base = (process.env.MAILPIT_URL || "http://localhost:8025").replace(/\/$/, "");
const url = `${base}/api/v1/chaos`;
const names = { destinatario: "Recipient", recipient: "Recipient", remetente: "Sender", sender: "Sender", autenticacao: "Authentication", auth: "Authentication" };
const defaults = { Sender: 451, Recipient: 451, Authentication: 535 };
const out = text => process.stdout.write(`${text}\n`);
const [command = "status", codeArg, probabilityArg] = process.argv.slice(2);

async function call(method, body) {
  const response = await fetch(url, { method, headers: { "content-type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${text.trim()}`);
  return text ? JSON.parse(text) : {};
}
const show = triggers => {
  for (const key of ["Sender", "Recipient", "Authentication"]) {
    const item = triggers?.[key] ?? {};
    out(`- ${key}: ${item.Probability ? `falha em ${item.Probability}% dos envios com código ${item.ErrorCode}` : "desligado"}`);
  }
};

try {
  if (command === "status") {
    show(await call("GET"));
  } else if (command === "off") {
    show(await call("PUT", Object.fromEntries(Object.entries(defaults).map(([key, code]) => [key, { ErrorCode: code, Probability: 0 }]))));
    out("Falhas simuladas desligadas.");
  } else if (names[command]) {
    const key = names[command];
    const current = await call("GET");
    const ErrorCode = Number(codeArg || defaults[key]);
    const Probability = Number(probabilityArg || 100);
    if (!(ErrorCode >= 400 && ErrorCode <= 599) || !(Probability >= 0 && Probability <= 100)) throw new Error("use código entre 400 e 599 e probabilidade entre 0 e 100.");
    show(await call("PUT", { ...current, [key]: { ErrorCode, Probability } }));
    out("Lembre de rodar \"npm run mailpit:chaos -- off\" ao terminar.");
  } else {
    throw new Error(`comando desconhecido "${command}". Use status, off, destinatario, remetente ou autenticacao.`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`ERRO: ${/fetch failed|ECONNREFUSED/i.test(message) ? `Mailpit não encontrado em ${base} (rode "docker compose up -d mailpit").` : /chaos/i.test(message) && /enabl/i.test(message) ? "o Mailpit está sem o modo chaos. Recrie o contêiner: docker compose up -d --force-recreate mailpit" : message}\n`);
  process.exitCode = 1;
}
