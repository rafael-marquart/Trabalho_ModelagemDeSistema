import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer as createSmtpServer } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = Number(process.env.AUTH_E2E_PORT || "3187");
const SMTP_PORT = Number(process.env.AUTH_E2E_SMTP_PORT || "2527");
const HERE_PORT = Number(process.env.AUTH_E2E_HERE_PORT || "2529");
const HERE_KEY = "e2e-here-key";
const HERE_REQUESTS = [];
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PUBLIC_URL = `https://127.0.0.1:${PORT}`;
const TEST_IP = "192.0.2.77";
const LOCKOUT_TEST_IP = "198.51.100.42";
const EMAIL = `spec001-e2e-${randomUUID()}@example.test`;
const COMPANY_EMAIL = `spec001-company-${randomUUID()}@example.test`;
const RECRUITER_EMAIL = `spec001-recruiter-${randomUUID()}@example.test`;
const SECOND_COMPANY_EMAIL = `spec001-company-two-${randomUUID()}@example.test`;
const CROSS_COMPANY_INVITATION_EMAIL = `spec001-cross-company-invite-${randomUUID()}@example.test`;
const UNKNOWN_COMPANY_EMAIL = `unknown-company-${randomUUID()}@example.test`;
const OLD_PASSWORD = "InitialPassword123";
const NEW_PASSWORD = "ChangedPassword456";
const COMPANY_PASSWORD = "CompanyPassword123";
const RECRUITER_PASSWORD = "RecruiterPassword123";
const SMTP_MESSAGES = [];
const SMTP_SOCKETS = new Set();
let app;
let appSpawnError;
let appOutput = "";

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function extractEmailToken(previousMessageCount, expectedPath) {
  const mail = SMTP_MESSAGES.slice(previousMessageCount).join("\n");
  // Decode the SMTP message's transfer encoding before parsing the URL.
  // This keeps the assertion aligned with the token a real recipient receives.
  const transferEncoding = mail.match(/content-transfer-encoding:\s*([\w-]+)/i)?.[1]?.toLowerCase();
  let decodedMail = mail;
  if (transferEncoding === "base64") {
    const body = mail.split(/\r?\n\r?\n/, 2)[1] || "";
    decodedMail = Buffer.from(body.replace(/\s/g, ""), "base64").toString("utf8");
  } else if (transferEncoding === "quoted-printable") {
    decodedMail = mail
      .replace(/=\r?\n/g, "")
      .replace(/=([0-9A-F]{2})/gi, (_match, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
  }
  const tokenMatches = [...decodedMail.matchAll(/(?:\?|&)token=([A-Za-z0-9_-]{43})(?=[\s&"'<>]|$)/g)]
    .filter(match => decodedMail.slice(Math.max(0, match.index - expectedPath.length - 16), match.index).includes(expectedPath));
  assert.equal(
    tokenMatches.length,
    1,
    `test SMTP message must contain exactly one 43-character token for ${expectedPath}`
  );
  return tokenMatches[0][1];
}

function startTestSmtp() {
  const server = createSmtpServer(socket => {
    SMTP_SOCKETS.add(socket);
    socket.write("220 acessa-vagas-test ESMTP\r\n");
    let buffer = "";
    let inData = false;
    let dataLines = [];

    socket.on("data", chunk => {
      buffer += chunk.toString("utf8");
      let lineEnd;
      while ((lineEnd = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);

        if (inData) {
          if (line === ".") {
            SMTP_MESSAGES.push(dataLines.join("\r\n"));
            dataLines = [];
            inData = false;
            socket.write("250 2.0.0 Message accepted\r\n");
          } else {
            dataLines.push(line.startsWith("..") ? line.slice(1) : line);
          }
          continue;
        }

        const command = line.toUpperCase();
        if (command.startsWith("EHLO") || command.startsWith("HELO")) {
          socket.write("250-acessa-vagas-test\r\n250 OK\r\n");
        } else if (command.startsWith("MAIL FROM")) {
          socket.write("250 2.1.0 Sender accepted\r\n");
        } else if (command.startsWith("RCPT TO")) {
          socket.write("250 2.1.5 Recipient accepted\r\n");
        } else if (command === "DATA") {
          inData = true;
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
        } else if (command === "RSET" || command === "NOOP") {
          socket.write("250 2.0.0 OK\r\n");
        } else if (command.startsWith("AUTH")) {
          socket.write("503 5.5.1 Authentication is disabled in the test SMTP server\r\n");
        } else if (command === "QUIT") {
          socket.write("221 2.0.0 Bye\r\n");
          socket.end();
        } else {
          socket.write("250 2.0.0 OK\r\n");
        }
      }
    });

    socket.on("close", () => SMTP_SOCKETS.delete(socket));
    socket.on("error", () => SMTP_SOCKETS.delete(socket));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(SMTP_PORT, "127.0.0.1", () => resolve(server));
  });
}

// Local stand-in for the HERE APIs: the E2E never reaches the real provider or spends the free-plan quota.
function startFakeHere() {
  const server = createHttpServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${HERE_PORT}`);
    HERE_REQUESTS.push({ path: url.pathname, params: Object.fromEntries(url.searchParams), key: url.searchParams.get("apiKey") });
    const send = (status, body) => { response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(body)); };
    if (url.searchParams.get("apiKey") !== HERE_KEY) return send(401, { error: "bad key" });
    if (url.pathname === "/geocode") {
      if ((url.searchParams.get("q") || "").includes("QUOTA")) return send(429, { error: "quota" });
      return send(200, { items: [{ position: { lat: -23.56, lng: -46.65 } }] });
    }
    if (url.pathname === "/router") return send(200, { routes: [{ sections: [{ summary: { duration: 1200 } }] }] });
    if (url.pathname === "/transit") return send(200, { routes: [{ sections: [{ travelSummary: { duration: 900 } }, { travelSummary: { duration: 900 } }] }] });
    return send(404, {});
  });
  return new Promise((resolve, reject) => { server.once("error", reject); server.listen(HERE_PORT, "127.0.0.1", () => resolve(server)); });
}

async function waitForApp(child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (appSpawnError) throw appSpawnError;
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited with code ${child.exitCode}.\n${appOutput}`);
    }
    try {
      const response = await fetch(`${BASE_URL}/`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // The server may still be starting.
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for Next.js.\n${appOutput}`);
}

async function postJson(path, payload, extraHeaders = {}) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": TEST_IP,
      ...extraHeaders
    },
    body: JSON.stringify(payload),
    redirect: "manual"
  });
}

async function expectStatus(response, expected, description) {
  const body = await response.text();
  assert.equal(
    response.status,
    expected,
    `${description}: expected HTTP ${expected}, got ${response.status}. Response: ${body.slice(0, 1200)}. Next.js output: ${appOutput.slice(-5000)}`
  );
  return body;
}

async function cleanupTestData() {
  const users = await prisma.user.findMany({
    where: { email: { in: [EMAIL, COMPANY_EMAIL, RECRUITER_EMAIL, SECOND_COMPANY_EMAIL, CROSS_COMPANY_INVITATION_EMAIL] } },
    select: { id: true, company: { select: { id: true } } }
  });
  if (!users.length) return;

  const userIds = users.map(user => user.id);
  const companyIds = users.flatMap(user => user.company ? [user.company.id] : []);
  const ipKey = digest(TEST_IP);
  const loginIpKeys = [ipKey, digest(LOCKOUT_TEST_IP)];
  const companyVerificationIpKey = digest(`company-verification:ip:${TEST_IP}`);
  const recoveryKeys = userIds.map(id => digest(`user:${id}`));
  const companyVerificationKeys = [
    ...userIds.map(id => digest(`company-verification:user:${id}`)),
    digest(`company-verification:input:${UNKNOWN_COMPANY_EMAIL}`)
  ];
  const auditSubjectIds = [...userIds, ...companyIds];

  await prisma.$transaction(async tx => {
    // Capture resource IDs before deleting them so audit rows keyed by invitation/link
    // IDs are cleaned up as well as events keyed by the test users and companies.
    const relatedLinks = await tx.recruiterLink.findMany({
      where: { OR: [{ companyId: { in: companyIds } }, { recruiterId: { in: userIds } }] },
      select: { id: true }
    });
    const relatedInvitations = await tx.recruiterInvitation.findMany({
      where: { OR: [{ companyId: { in: companyIds } }, { recipientUserId: { in: userIds } }, { sentByUserId: { in: userIds } }] },
      select: { id: true }
    });
    const relatedJobs = await tx.job.findMany({
      where: { OR: [{ companyId: { in: companyIds } }, { createdByUserId: { in: userIds } }] },
      select: { id: true }
    });
    const relatedSubjectIds = [
      ...auditSubjectIds,
      ...relatedJobs.map(job => job.id),
      ...relatedLinks.map(link => link.id),
      ...relatedInvitations.map(invitation => invitation.id)
    ];

    await tx.compatibilityResult.deleteMany({ where: { OR: [{ candidateUserId: { in: userIds } }, { jobId: { in: relatedJobs.map(job => job.id) } }] } });
    await tx.userPreference.deleteMany({ where: { userId: { in: userIds } } });
    await tx.job.deleteMany({
      where: { OR: [{ companyId: { in: companyIds } }, { createdByUserId: { in: userIds } }] }
    });
    await tx.recruiterLink.deleteMany({
      where: { OR: [{ companyId: { in: companyIds } }, { recruiterId: { in: userIds } }] }
    });
    await tx.recruiterInvitation.deleteMany({
      where: { OR: [{ companyId: { in: companyIds } }, { recipientUserId: { in: userIds } }, { sentByUserId: { in: userIds } }] }
    });
    await tx.companyEmailVerificationToken.deleteMany({ where: { companyId: { in: companyIds } } });
    await tx.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
    await tx.session.deleteMany({ where: { userId: { in: userIds } } });
    await tx.loginAttempt.deleteMany({ where: { ipKey: { in: loginIpKeys } } });
    await tx.loginBlock.deleteMany({ where: { ipKey: { in: loginIpKeys } } });
    await tx.recoveryAttempt.deleteMany({
      where: {
        OR: [
          { ipKey },
          { ipKey: companyVerificationIpKey },
          { identifierKey: { in: [...recoveryKeys, ...companyVerificationKeys] } }
        ]
      }
    });
    await tx.recoveryBlock.deleteMany({
      where: {
        scopeKey: {
          in: [
            ...recoveryKeys.map(key => `identifier:${key}`),
            `ip:${ipKey}`,
            ...companyVerificationKeys.map(key => `company-verification:identifier:${key}`),
            `company-verification:ip:${companyVerificationIpKey}`
          ]
        }
      }
    });
    await tx.auditEvent.deleteMany({
      where: {
        OR: [
          { actorUserId: { in: userIds } },
          { subjectId: { in: relatedSubjectIds } }
        ]
      }
    });
    const remainingTestAuditEvents = await tx.auditEvent.count({
      where: {
        OR: [
          { actorUserId: { in: userIds } },
          { subjectId: { in: relatedSubjectIds } }
        ]
      }
    });
    if (remainingTestAuditEvents !== 0) {
      throw new Error(`E2E cleanup left ${remainingTestAuditEvents} audit event(s) behind`);
    }
    await tx.candidateProfile.deleteMany({ where: { userId: { in: userIds } } });
    await tx.companyInfrastructure.deleteMany({ where: { companyId: { in: companyIds } } });
    await tx.company.deleteMany({ where: { id: { in: companyIds } } });
    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  });
}

async function main() {
  let smtpServer;
  let hereServer;
  let appExit;
  try {
    await prisma.$connect();
    smtpServer = await startTestSmtp();
    hereServer = await startFakeHere();

    const runtimeEnv = {
      ...process.env,
      NODE_ENV: "production",
      APP_BASE_URL: PUBLIC_URL,
      SESSION_COOKIE_NAME: "acessa_session",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: String(SMTP_PORT),
      SMTP_SECURE: "false",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      SMTP_FROM: "Acessa Vagas E2E <noreply@example.test>",
      HERE_API_KEY: HERE_KEY,
      HERE_GEOCODE_URL: `http://127.0.0.1:${HERE_PORT}/geocode`,
      HERE_ROUTER_URL: `http://127.0.0.1:${HERE_PORT}/router`,
      HERE_TRANSIT_URL: `http://127.0.0.1:${HERE_PORT}/transit`,
      NEXT_TELEMETRY_DISABLED: "1"
    };

    app = spawn(process.execPath, [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(PORT)
    ], {
      cwd: process.cwd(),
      env: runtimeEnv,
      stdio: ["ignore", "pipe", "pipe"]
    });
    app.once("error", error => { appSpawnError = error; });
    app.once("exit", (code, signal) => { appExit = { code, signal }; });
    app.stdout.on("data", chunk => { appOutput = (appOutput + chunk.toString()).slice(-8000); });
    app.stderr.on("data", chunk => { appOutput = (appOutput + chunk.toString()).slice(-8000); });

    await waitForApp(app);

    // Candidate registration and first login exercise the deployed route handlers,
    // real PostgreSQL transactions, password hashing and actual session cookies.
    const registration = await postJson("/api/auth/register/candidate", {
      fullName: "Candidato de Teste E2E",
      email: EMAIL,
      cpf: "52998224725",
      password: OLD_PASSWORD
    });
    await expectStatus(registration, 201, "candidate registration");

    const account = await prisma.user.findUnique({
      where: { email: EMAIL },
      select: { id: true, role: true, isActive: true }
    });
    assert.ok(account && account.role === "CANDIDATE" && account.isActive, "registered account must be active candidate");

    // Candidate login must work with CPF as well as email, including formatted CPF input.
    const cpfLogin = await postJson("/api/auth/login", {
      profile: "candidate",
      identifier: "529.982.247-25",
      password: OLD_PASSWORD,
      rememberMe: false
    });
    const cpfLoginBody = await expectStatus(cpfLogin, 200, "candidate login by CPF");
    assert.equal(JSON.parse(cpfLoginBody).redirectTo, "/candidato");
    assert.match(cpfLogin.headers.get("set-cookie") || "", /acessa_session=/, "CPF login must issue a session cookie");

    const firstLogin = await postJson("/api/auth/login", {
      profile: "candidate",
      identifier: EMAIL,
      password: OLD_PASSWORD,
      rememberMe: false
    });
    const firstLoginBody = await expectStatus(firstLogin, 200, "initial login");
    assert.equal(JSON.parse(firstLoginBody).redirectTo, "/candidato");
    const setCookie = firstLogin.headers.get("set-cookie") || "";
    const cookieMatch = setCookie.match(/(?:^|,\s*)acessa_session=([^;]+)/);
    assert.ok(cookieMatch?.[1], "login must issue the session cookie");
    const oldCookie = `acessa_session=${cookieMatch[1]}`;

    const candidatePage = await fetch(`${BASE_URL}/candidato`, {
      headers: { cookie: oldCookie },
      redirect: "manual"
    });
    await expectStatus(candidatePage, 200, "authenticated candidate page");

    // The real email transport points only to the local capture server in this job.
    const previousMessageCount = SMTP_MESSAGES.length;
    const recovery = await postJson("/api/auth/password/forgot", {
      profile: "candidate",
      identifier: EMAIL
    });
    const recoveryBody = await expectStatus(recovery, 200, "password recovery request");
    assert.match(recoveryBody, /Se os dados corresponderem a uma conta elegível/);
    assert.ok(SMTP_MESSAGES.length > previousMessageCount, "password recovery must send an email to the test SMTP server");

    const rawToken = extractEmailToken(previousMessageCount, "/recuperar-senha");

    const storedToken = await prisma.passwordResetToken.findFirst({
      where: { userId: account.id },
      select: { tokenHash: true }
    });
    assert.ok(storedToken, "password recovery token must be stored");
    assert.equal(storedToken.tokenHash, digest(rawToken), "database must store only the SHA-256 digest of the emailed token");
    assert.notEqual(storedToken.tokenHash, rawToken);

    const reset = await postJson("/api/auth/password/reset", {
      token: rawToken,
      password: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD
    });
    await expectStatus(reset, 200, "password reset");

    const reuse = await postJson("/api/auth/password/reset", {
      token: rawToken,
      password: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD
    });
    await expectStatus(reuse, 400, "one-time token reuse");

    const staleSessionPage = await fetch(`${BASE_URL}/candidato`, {
      headers: { cookie: oldCookie },
      redirect: "manual"
    });
    assert.ok(
      [307, 308].includes(staleSessionPage.status) &&
        (staleSessionPage.headers.get("location") || "").includes("/candidato/login"),
      `password reset must revoke the prior session; received HTTP ${staleSessionPage.status}`
    );

    const oldPasswordLogin = await postJson("/api/auth/login", {
      profile: "candidate",
      identifier: EMAIL,
      password: OLD_PASSWORD,
      rememberMe: false
    });
    await expectStatus(oldPasswordLogin, 401, "old password after reset");

    const newPasswordLogin = await postJson("/api/auth/login", {
      profile: "candidate",
      identifier: EMAIL,
      password: NEW_PASSWORD,
      rememberMe: false
    });
    const newLoginBody = await expectStatus(newPasswordLogin, 200, "new password after reset");
    assert.equal(JSON.parse(newLoginBody).redirectTo, "/candidato");
    const newSetCookie = newPasswordLogin.headers.get("set-cookie") || "";
    const newCookieMatch = newSetCookie.match(/(?:^|,\s*)acessa_session=([^;]+)/);
    assert.ok(newCookieMatch?.[1], "new login must issue a replacement session");
    const newPage = await fetch(`${BASE_URL}/candidato`, {
      headers: { cookie: `acessa_session=${newCookieMatch[1]}` },
      redirect: "manual"
    });
    await expectStatus(newPage, 200, "candidate page after new login");

    // SPEC-002: candidate profile, accessibility catalog and optional attachments.
    const profileCookie = { cookie: `acessa_session=${newCookieMatch[1]}` };
    const profileOrigin = { origin: PUBLIC_URL };
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/perfil`, { redirect: "manual" }), 401, "anonymous profile read");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/catalogo-acessibilidade`, { redirect: "manual" }), 401, "anonymous catalog read");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/documentos`, { redirect: "manual" }), 401, "anonymous document list");

    const catalogBody = JSON.parse(await expectStatus(
      await fetch(`${BASE_URL}/api/candidato/catalogo-acessibilidade`, { headers: profileCookie, redirect: "manual" }),
      200, "candidate reads accessibility catalog"
    ));
    assert.equal(catalogBody.options.length, 16, "catalog must expose the 16 seeded options");
    const catalogCode = catalogBody.options.find(option => option.isActive)?.code;
    assert.ok(catalogCode, "catalog must contain an active option");

    const emptyProfile = JSON.parse(await expectStatus(
      await fetch(`${BASE_URL}/api/candidato/perfil`, { headers: profileCookie, redirect: "manual" }),
      200, "candidate reads empty profile"
    ));
    assert.equal(emptyProfile.profile.accessibilityDeclaration, "NOT_INFORMED");
    assert.deepEqual(emptyProfile.profile.education, []);

    const profilePayload = {
      education: [{ level: "Ensino superior (graduação)", course: "Sistemas — Noturno", institution: "Instituto Federal", status: "Concluído" }],
      languages: [{ language: "Inglês", level: "Avançado" }],
      professionalExperience: [{ role: "Atendente", company: "Loja Exemplo", period: "2022 a 2024" }], courses: ["Excel avançado"], certifications: [],
      professionalLinks: ["https://example.test/perfil"],
      workPreferences: { modalities: ["Híbrido", "Remoto"], city: "Recife", state: "PE", address: "", transportMode: "Ônibus" },
      accessibilityDeclaration: "NEEDS_DECLARED",
      accessibilityNeeds: [], accessibilityNeedOptionCodes: [catalogCode], essentialAccessibilityResources: ["Leitor de tela"]
    };
    const putProfile = (payload, headers = {}) => fetch(`${BASE_URL}/api/candidato/perfil`, {
      method: "PUT",
      headers: { "content-type": "application/json", "x-forwarded-for": TEST_IP, ...profileOrigin, ...headers },
      body: JSON.stringify(payload), redirect: "manual"
    });
    await expectStatus(await putProfile(profilePayload), 401, "anonymous profile save");
    await expectStatus(await putProfile({ ...profilePayload, accessibilityNeedOptionCodes: [], accessibilityNeeds: [] }, profileCookie),
      400, "needs declared without any option is rejected");
    await expectStatus(await putProfile({ ...profilePayload, education: ["Ensino médio — Geral"] }, profileCookie),
      400, "legacy text education is rejected on save");
    await expectStatus(await putProfile({ ...profilePayload, accessibilityNeedOptionCodes: ["ZZZ99"] }, profileCookie),
      400, "unknown catalog code is rejected");
    await expectStatus(await putProfile(profilePayload, { ...profileCookie, origin: "https://evil.example" }),
      403, "cross-origin profile save is rejected");
    await expectStatus(await putProfile(profilePayload, profileCookie), 200, "candidate saves structured profile");

    const savedProfile = JSON.parse(await expectStatus(
      await fetch(`${BASE_URL}/api/candidato/perfil`, { headers: profileCookie, redirect: "manual" }),
      200, "candidate reads saved profile"
    ));
    assert.deepEqual(savedProfile.profile.education, profilePayload.education, "education must round-trip as structured objects");
    assert.deepEqual(savedProfile.profile.professionalExperience, profilePayload.professionalExperience, "experiences must round-trip as structured objects");
    assert.deepEqual(savedProfile.profile.workPreferences, profilePayload.workPreferences, "work preferences must round-trip");
    await expectStatus(await putProfile({ ...profilePayload, workPreferences: { ...profilePayload.workPreferences, state: "XX" } }, profileCookie),
      400, "unknown state is rejected");
    assert.deepEqual(savedProfile.profile.languages, profilePayload.languages, "languages must round-trip as structured objects");
    assert.deepEqual(savedProfile.profile.accessibilityNeedOptionCodes, [catalogCode]);

    const profileAudit = await prisma.auditEvent.findMany({
      where: { actorUserId: account.id, eventType: { startsWith: "CANDIDATE_PROFILE" } }, select: { metadata: true }
    });
    assert.ok(profileAudit.length >= 1, "saving the profile must create an audit event");
    assert.ok(!JSON.stringify(profileAudit).includes("Leitor de tela"), "audit events must not contain declared values");

    const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
    const uploadForm = (name, bytes, category = "COURSE") => {
      const form = new FormData();
      form.set("category", category); form.set("displayName", "Comprovante de curso");
      form.set("file", new Blob([bytes]), name);
      return form;
    };
    const upload = (form, headers) => fetch(`${BASE_URL}/api/candidato/documentos`, {
      method: "POST", headers: { "x-forwarded-for": TEST_IP, ...profileOrigin, ...headers }, body: form, redirect: "manual"
    });
    await expectStatus(await upload(uploadForm("anon.pdf", pdfBytes), {}), 401, "anonymous upload");
    await expectStatus(await upload(uploadForm("fake.pdf", Buffer.from("not a pdf")), profileCookie), 400, "upload with mismatched content");
    await expectStatus(await upload(uploadForm("script.exe", pdfBytes), profileCookie), 400, "upload with forbidden extension");
    const uploaded = JSON.parse(await expectStatus(await upload(uploadForm("curso.pdf", pdfBytes), profileCookie), 201, "valid upload"));
    const documentId = uploaded.document.id;
    const listed = JSON.parse(await expectStatus(
      await fetch(`${BASE_URL}/api/candidato/documentos`, { headers: profileCookie, redirect: "manual" }), 200, "list documents"
    ));
    assert.equal(listed.documents.length, 1);
    const download = await fetch(`${BASE_URL}/api/candidato/documentos/${documentId}`, { headers: profileCookie, redirect: "manual" });
    await expectStatus(download.clone(), 200, "owner downloads own document");
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdfBytes, "downloaded bytes must match the upload");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/documentos/${documentId}`, { redirect: "manual" }), 401, "anonymous download");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/documentos/${documentId}`, {
      method: "DELETE", headers: { ...profileOrigin }, redirect: "manual"
    }), 401, "anonymous delete");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/documentos/${documentId}`, {
      method: "DELETE", headers: { ...profileCookie, ...profileOrigin }, redirect: "manual"
    }), 200, "owner deletes own document");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/documentos/${documentId}`, { headers: profileCookie, redirect: "manual" }),
      404, "deleted document is gone");
    const documentAudit = await prisma.auditEvent.findMany({
      where: { actorUserId: account.id, eventType: { in: ["CANDIDATE_PROFILE_DOCUMENT_ADDED", "CANDIDATE_PROFILE_DOCUMENT_REMOVED"] } },
      select: { eventType: true }
    });
    assert.equal(documentAudit.length, 2, "upload and removal must each create an audit event");

    // Company recruiter-management endpoints must reject anonymous callers and
    // authenticated users with the wrong role, including write operations.
    const anonymousCompanyLinks = await fetch(`${BASE_URL}/api/company/recruiter-links`, {
      redirect: "manual"
    });
    await expectStatus(anonymousCompanyLinks, 401, "anonymous access to company recruiter links");

    const anonymousCompanyInvitations = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      redirect: "manual"
    });
    await expectStatus(anonymousCompanyInvitations, 401, "anonymous access to company recruiter invitations");

    const anonymousCreateInvitation = await postJson("/api/company/recruiter-invitations", {
      email: CROSS_COMPANY_INVITATION_EMAIL,
      fullName: "Tentativa Anônima"
    });
    await expectStatus(anonymousCreateInvitation, 401, "anonymous caller cannot create a company recruiter invitation");
    const anonymousInvitationRecipient = await prisma.user.findUnique({
      where: { email: CROSS_COMPANY_INVITATION_EMAIL },
      select: { id: true }
    });
    assert.equal(anonymousInvitationRecipient, null, "anonymous invitation attempt must not create a recruiter account");

    const anonymousCancelInvitation = await postJson("/api/company/recruiter-invitations/cancel", {
      invitationId: randomUUID()
    });
    await expectStatus(anonymousCancelInvitation, 401, "anonymous caller cannot cancel a company recruiter invitation");

    const anonymousEndRecruiterLink = await postJson("/api/company/recruiter-links/end", {
      recruiterLinkId: randomUUID()
    });
    await expectStatus(anonymousEndRecruiterLink, 401, "anonymous caller cannot end a company recruiter link");

    const candidateCompanyLinks = await fetch(`${BASE_URL}/api/company/recruiter-links`, {
      headers: { cookie: `acessa_session=${newCookieMatch[1]}` },
      redirect: "manual"
    });
    await expectStatus(candidateCompanyLinks, 401, "candidate access to company recruiter links");

    const candidateCompanyInvitations = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: `acessa_session=${newCookieMatch[1]}` },
      redirect: "manual"
    });
    await expectStatus(candidateCompanyInvitations, 401, "candidate access to company recruiter invitations");

    const candidateCreateInvitation = await postJson("/api/company/recruiter-invitations", {
      email: `unauthorized-${randomUUID()}@example.test`,
      fullName: "Tentativa Não Autorizada"
    }, { cookie: `acessa_session=${newCookieMatch[1]}` });
    await expectStatus(candidateCreateInvitation, 401, "candidate attempts to create company recruiter invitation");

    const candidateCancelInvitation = await postJson("/api/company/recruiter-invitations/cancel", {
      invitationId: randomUUID()
    }, { cookie: `acessa_session=${newCookieMatch[1]}` });
    await expectStatus(candidateCancelInvitation, 401, "candidate attempts to cancel company recruiter invitation");

    const candidateEndRecruiterLink = await postJson("/api/company/recruiter-links/end", {
      recruiterLinkId: randomUUID()
    }, { cookie: `acessa_session=${newCookieMatch[1]}` });
    await expectStatus(candidateEndRecruiterLink, 401, "candidate attempts to end company recruiter link");

    // Force the persisted idle expiry and prove the real protected page rejects the stale cookie.
    await prisma.session.updateMany({
      where: { tokenHash: digest(newCookieMatch[1]) },
      data: { expiresAt: new Date(Date.now() - 1000) }
    });
    const expiredSessionPage = await fetch(`${BASE_URL}/candidato`, {
      headers: { cookie: `acessa_session=${newCookieMatch[1]}` },
      redirect: "manual"
    });
    assert.ok(
      [307, 308].includes(expiredSessionPage.status) &&
        (expiredSessionPage.headers.get("location") || "").includes("/candidato/login"),
      `expired session must not access the candidate page; received HTTP ${expiredSessionPage.status}`
    );
    const expiredSessionCount = await prisma.session.count({ where: { tokenHash: digest(newCookieMatch[1]) } });
    assert.equal(expiredSessionCount, 0, "expired session must be removed from persistent storage");

    // Company registration and email verification exercise the inactive-to-active transition.
    const companyEmailCount = SMTP_MESSAGES.length;
    const companyRegistration = await postJson("/api/auth/register/company", {
      legalName: "Empresa de Teste E2E",
      tradeName: "Empresa E2E",
      officialId: "12345678000195",
      contactEmail: COMPANY_EMAIL,
      password: COMPANY_PASSWORD
    });
    await expectStatus(companyRegistration, 201, "company registration");
    const companyAccount = await prisma.user.findUnique({
      where: { email: COMPANY_EMAIL },
      select: { id: true, role: true, isActive: true, company: { select: { id: true, emailConfirmedAt: true } } }
    });
    assert.ok(companyAccount?.company && companyAccount.role === "COMPANY" && !companyAccount.isActive, "company must remain inactive before email verification");
    assert.equal(companyAccount.company.emailConfirmedAt, null);

    let emailCount = SMTP_MESSAGES.length;
    const firstCompanyVerificationToken = extractEmailToken(companyEmailCount, "/empresa/confirmar-email");
    const storedVerification = await prisma.companyEmailVerificationToken.findFirst({
      where: { companyId: companyAccount.company.id },
      select: { tokenHash: true }
    });
    assert.ok(storedVerification, "company verification token must be stored");
    assert.equal(storedVerification.tokenHash, digest(firstCompanyVerificationToken), "database must store only the SHA-256 digest of the company verification token");

    emailCount = SMTP_MESSAGES.length;
    const resendCompanyVerification = await postJson("/api/auth/company/resend-verification", { email: COMPANY_EMAIL });
    const resendCompanyBody = await expectStatus(resendCompanyVerification, 200, "company verification resend");
    assert.match(resendCompanyBody, /Se houver uma conta empresarial pendente/);
    const currentCompanyVerificationToken = extractEmailToken(emailCount, "/empresa/confirmar-email");
    assert.notEqual(currentCompanyVerificationToken, firstCompanyVerificationToken, "resending company verification must issue a new token");
    const updatedStoredVerification = await prisma.companyEmailVerificationToken.findFirst({
      where: { companyId: companyAccount.company.id },
      select: { tokenHash: true }
    });
    assert.equal(updatedStoredVerification?.tokenHash, digest(currentCompanyVerificationToken), "resend must replace the stored company verification token hash");

    const staleCompanyVerification = await postJson("/api/auth/company/verify-email", { token: firstCompanyVerificationToken });
    await expectStatus(staleCompanyVerification, 400, "previous company verification token after resend");
    const unknownResend = await postJson("/api/auth/company/resend-verification", { email: UNKNOWN_COMPANY_EMAIL });
    const unknownResendBody = await expectStatus(unknownResend, 200, "unknown company verification resend");
    assert.equal(unknownResendBody, resendCompanyBody, "company verification resend must not reveal whether an account exists");

    const verifyCompany = await postJson("/api/auth/company/verify-email", { token: currentCompanyVerificationToken });
    await expectStatus(verifyCompany, 200, "company email verification");
    const reusedVerification = await postJson("/api/auth/company/verify-email", { token: currentCompanyVerificationToken });
    await expectStatus(reusedVerification, 400, "company verification token reuse");
    const activatedCompany = await prisma.user.findUnique({
      where: { id: companyAccount.id },
      select: { isActive: true, company: { select: { emailConfirmedAt: true } } }
    });
    assert.ok(activatedCompany?.isActive && activatedCompany.company?.emailConfirmedAt, "email verification must activate the company account");

    // Company password recovery must deliver a usable one-time link and accept the new password.
    emailCount = SMTP_MESSAGES.length;
    const companyRecovery = await postJson("/api/auth/password/forgot", {
      profile: "company",
      identifier: COMPANY_EMAIL
    });
    const companyRecoveryBody = await expectStatus(companyRecovery, 200, "company password recovery request");
    assert.match(companyRecoveryBody, /Se os dados corresponderem a uma conta elegível/);
    assert.ok(SMTP_MESSAGES.length > emailCount, "company password recovery must send an email to the test SMTP server");
    const companyRecoveryToken = extractEmailToken(emailCount, "/recuperar-senha");

    const companyPasswordReset = await postJson("/api/auth/password/reset", {
      token: companyRecoveryToken,
      password: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD
    });
    await expectStatus(companyPasswordReset, 200, "company password reset");
    const reusedCompanyRecovery = await postJson("/api/auth/password/reset", {
      token: companyRecoveryToken,
      password: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD
    });
    await expectStatus(reusedCompanyRecovery, 400, "company recovery token reuse");

    const oldCompanyPasswordLogin = await postJson("/api/auth/login", {
      profile: "company",
      identifier: COMPANY_EMAIL,
      password: COMPANY_PASSWORD,
      rememberMe: false
    });
    await expectStatus(oldCompanyPasswordLogin, 401, "old company password after reset");

    const companyLogin = await postJson("/api/auth/login", {
      profile: "company",
      identifier: COMPANY_EMAIL,
      password: NEW_PASSWORD,
      rememberMe: false
    });
    const companyLoginBody = await expectStatus(companyLogin, 200, "company login after verification");
    assert.equal(JSON.parse(companyLoginBody).redirectTo, "/empresa");
    const companyCookieMatch = (companyLogin.headers.get("set-cookie") || "").match(/(?:^|,\s*)acessa_session=([^;]+)/);
    assert.ok(companyCookieMatch?.[1], "company login must issue a session cookie");
    const companyCookie = `acessa_session=${companyCookieMatch[1]}`;

    // Invite a new recruiter, resend to invalidate the previous link, and accept the latest link.
    emailCount = SMTP_MESSAGES.length;
    const invite = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(invite, 202, "recruiter invitation");
    const firstInvitationToken = extractEmailToken(emailCount, "/recrutador/convite");

    emailCount = SMTP_MESSAGES.length;
    const resend = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(resend, 202, "recruiter invitation resend");
    const currentInvitationToken = extractEmailToken(emailCount, "/recrutador/convite");
    assert.notEqual(currentInvitationToken, firstInvitationToken, "resending must issue a new invitation token");

    const recruiterAccount = await prisma.user.findUnique({
      where: { email: RECRUITER_EMAIL },
      select: { id: true, role: true, isActive: true, pendingActivation: true }
    });
    assert.ok(recruiterAccount && recruiterAccount.role === "RECRUITER" && !recruiterAccount.isActive && recruiterAccount.pendingActivation, "invited recruiter must remain inactive until accepting the invitation");
    const invitationRecord = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id },
      select: { id: true, tokenHash: true, status: true }
    });
    assert.ok(invitationRecord && invitationRecord.status === "PENDING", "resend must preserve one pending invitation");
    assert.equal(invitationRecord.tokenHash, digest(currentInvitationToken), "database must store only the SHA-256 digest of the current invitation token");
    assert.notEqual(invitationRecord.tokenHash, digest(firstInvitationToken), "resend must invalidate the previous invitation token");
    const sentAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_SENT", subjectId: invitationRecord.id }
    });
    assert.equal(sentAuditCount, 1, "creating an invitation must emit exactly one sent event");
    const resentAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_RESENT", subjectId: invitationRecord.id }
    });
    assert.equal(resentAuditCount, 1, "resending an invitation must emit exactly one resend event");

    const staleInvitation = await postJson("/api/recruiter/invitations/respond", {
      token: firstInvitationToken,
      action: "accept",
      password: RECRUITER_PASSWORD
    });
    await expectStatus(staleInvitation, 400, "previous recruiter invitation token after resend");

    const acceptInvitation = await postJson("/api/recruiter/invitations/respond", {
      token: currentInvitationToken,
      action: "accept",
      password: RECRUITER_PASSWORD
    });
    await expectStatus(acceptInvitation, 200, "accept recruiter invitation and activate account");
    const acceptedAuditCount = await prisma.auditEvent.count({
      where: {
        eventType: "RECRUITER_ACCOUNT_ACTIVATED_AND_INVITATION_ACCEPTED",
        subjectId: invitationRecord.id
      }
    });
    assert.equal(acceptedAuditCount, 1, "accepting and activating a new recruiter must emit exactly one audit event");

    const acceptedRecruiter = await prisma.user.findUnique({
      where: { id: recruiterAccount.id },
      select: { isActive: true, pendingActivation: true }
    });
    assert.ok(acceptedRecruiter?.isActive && !acceptedRecruiter.pendingActivation, "accepting the invitation must activate the recruiter account");
    const activeLink = await prisma.recruiterLink.findFirst({
      where: { companyId: companyAccount.company.id, recruiterId: recruiterAccount.id, active: true },
      select: { id: true }
    });
    assert.ok(activeLink, "accepting the invitation must create an active company link");

    const listedLinks = await fetch(`${BASE_URL}/api/company/recruiter-links`, {
      headers: { cookie: companyCookie },
      redirect: "manual"
    });
    const listedLinksBody = await expectStatus(listedLinks, 200, "company recruiter links list");
    assert.ok(JSON.parse(listedLinksBody).links.some(link => link.recruiter.email === RECRUITER_EMAIL), "company must see its active recruiter link");

    const recruiterLogin = await postJson("/api/auth/login", {
      profile: "recruiter",
      identifier: RECRUITER_EMAIL,
      password: RECRUITER_PASSWORD,
      rememberMe: false
    });
    const recruiterLoginBody = await expectStatus(recruiterLogin, 200, "recruiter login after activation");
    assert.equal(JSON.parse(recruiterLoginBody).redirectTo, "/recrutador");
    const recruiterCookieMatch = (recruiterLogin.headers.get("set-cookie") || "").match(/(?:^|,\s*)acessa_session=([^;]+)/);
    assert.ok(recruiterCookieMatch?.[1], "recruiter login must issue a session cookie");
    const recruiterCookie = `acessa_session=${recruiterCookieMatch[1]}`;

    const recruiterCompanyLinks = await fetch(`${BASE_URL}/api/company/recruiter-links`, {
      headers: { cookie: recruiterCookie },
      redirect: "manual"
    });
    await expectStatus(recruiterCompanyLinks, 401, "recruiter role cannot access company recruiter links endpoint");
    const recruiterCompanyInvitations = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: recruiterCookie },
      redirect: "manual"
    });
    await expectStatus(recruiterCompanyInvitations, 401, "recruiter role cannot access company recruiter invitations endpoint");
    const recruiterCreateInvitation = await postJson("/api/company/recruiter-invitations", {
      email: `unauthorized-recruiter-${randomUUID()}@example.test`,
      fullName: "Tentativa de Recrutador"
    }, { cookie: recruiterCookie });
    await expectStatus(recruiterCreateInvitation, 401, "recruiter role cannot create company recruiter invitation");

    const unauthorizedRecruiterEndAuditBefore = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_LINK_ENDED", subjectId: activeLink.id }
    });
    const recruiterEndOwnCompanyLink = await postJson(
      "/api/company/recruiter-links/end",
      { recruiterLinkId: activeLink.id },
      { cookie: recruiterCookie }
    );
    await expectStatus(recruiterEndOwnCompanyLink, 401, "recruiter role cannot end a company-owned link");
    const activeLinkAfterRecruiterAttempt = await prisma.recruiterLink.findUnique({
      where: { id: activeLink.id },
      select: { active: true }
    });
    assert.equal(activeLinkAfterRecruiterAttempt?.active, true, "recruiter role attempt must not end a company-owned link");
    const unauthorizedRecruiterEndAuditAfter = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_LINK_ENDED", subjectId: activeLink.id }
    });
    assert.equal(
      unauthorizedRecruiterEndAuditAfter,
      unauthorizedRecruiterEndAuditBefore,
      "recruiter role attempt must not create a link-end audit event"
    );

    const endInitialLink = await postJson("/api/company/recruiter-links/end", { recruiterLinkId: activeLink.id }, { cookie: companyCookie });
    await expectStatus(endInitialLink, 200, "company ends its own recruiter link");
    const initialLinkEndAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_LINK_ENDED", subjectId: activeLink.id }
    });
    assert.equal(initialLinkEndAuditCount, 1, "ending an active recruiter link must emit exactly one audit event");
    const preservedRecruiter = await prisma.user.findUnique({
      where: { id: recruiterAccount.id },
      select: { id: true, isActive: true }
    });
    const endedInitialLink = await prisma.recruiterLink.findUnique({ where: { id: activeLink.id }, select: { active: true, endedAt: true } });
    assert.ok(preservedRecruiter?.isActive && endedInitialLink && !endedInitialLink.active && endedInitialLink.endedAt, "ending a link must preserve the recruiter account while deactivating only the company link");

    const reusedInvitation = await postJson("/api/recruiter/invitations/respond", {
      token: currentInvitationToken,
      action: "accept",
      password: RECRUITER_PASSWORD
    });
    await expectStatus(reusedInvitation, 400, "accepted recruiter invitation token reuse");

    // Cancellation must revoke a pending invitation without affecting the recruiter account.
    emailCount = SMTP_MESSAGES.length;
    const cancelInvite = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Nome informado pela empresa"
    }, { cookie: companyCookie });
    await expectStatus(cancelInvite, 202, "new invitation before cancellation");
    const cancelToken = extractEmailToken(emailCount, "/recrutador/convite");
    const pendingToCancel = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, tokenHash: true }
    });
    assert.ok(pendingToCancel && pendingToCancel.tokenHash === digest(cancelToken), "cancellable invitation token must match the stored digest");
    const invitationSnapshotResponse = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: companyCookie },
      redirect: "manual"
    });
    const invitationSnapshotBody = await expectStatus(invitationSnapshotResponse, 200, "company lists its invitation using the submitted recipient snapshot");
    const invitationSnapshot = JSON.parse(invitationSnapshotBody).invitations.find(invitation => invitation.id === pendingToCancel.id);
    assert.deepEqual(
      invitationSnapshot?.recipient,
      { fullName: "Nome informado pela empresa", email: RECRUITER_EMAIL },
      "invitation list must return only the recipient details supplied by the company, not live profile data"
    );
    assert.notEqual(
      invitationSnapshot?.recipient.fullName,
      "Recrutador de Teste E2E",
      "invitation list must not disclose the existing recruiter's current profile name"
    );
    const unauthorizedRecruiterCancelAuditBefore = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_CANCELLED", subjectId: pendingToCancel.id }
    });
    const recruiterCancelOwnedInvitation = await postJson(
      "/api/company/recruiter-invitations/cancel",
      { invitationId: pendingToCancel.id },
      { cookie: recruiterCookie }
    );
    await expectStatus(recruiterCancelOwnedInvitation, 401, "recruiter role cannot cancel a company-owned invitation");
    const invitationAfterRecruiterCancelAttempt = await prisma.recruiterInvitation.findUnique({
      where: { id: pendingToCancel.id },
      select: { status: true }
    });
    assert.equal(invitationAfterRecruiterCancelAttempt?.status, "PENDING", "recruiter role attempt must not cancel a company-owned invitation");
    const unauthorizedRecruiterCancelAuditAfter = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_CANCELLED", subjectId: pendingToCancel.id }
    });
    assert.equal(
      unauthorizedRecruiterCancelAuditAfter,
      unauthorizedRecruiterCancelAuditBefore,
      "recruiter role attempt must not create an invitation-cancel audit event"
    );

    const concurrentCancelResponses = await Promise.all([
      postJson("/api/company/recruiter-invitations/cancel", { invitationId: pendingToCancel.id }, { cookie: companyCookie }),
      postJson("/api/company/recruiter-invitations/cancel", { invitationId: pendingToCancel.id }, { cookie: companyCookie })
    ]);
    assert.deepEqual(
      concurrentCancelResponses.map(response => response.status).sort((a, b) => a - b),
      [200, 409],
      "exactly one concurrent request may cancel the same pending invitation"
    );
    const cancelledInvitation = await prisma.recruiterInvitation.findUnique({ where: { id: pendingToCancel.id }, select: { status: true } });
    assert.equal(cancelledInvitation?.status, "CANCELLED");
    const cancellationAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_CANCELLED", subjectId: pendingToCancel.id }
    });
    assert.equal(cancellationAuditCount, 1, "concurrent cancellation must emit exactly one audit event");
    const cancelledTokenResponse = await postJson("/api/recruiter/invitations/respond", { token: cancelToken, action: "refuse" });
    await expectStatus(cancelledTokenResponse, 400, "cancelled recruiter invitation token");

    // Refusal is also a terminal state and must not create a link.
    emailCount = SMTP_MESSAGES.length;
    const refuseInvite = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(refuseInvite, 202, "new invitation before refusal");
    const refusalToken = extractEmailToken(emailCount, "/recrutador/convite");
    const refusal = await postJson("/api/recruiter/invitations/respond", { token: refusalToken, action: "refuse" });
    await expectStatus(refusal, 200, "recruiter refuses invitation");
    const refusedInvitation = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true }
    });
    assert.equal(refusedInvitation?.status, "REFUSED");
    assert.ok(refusedInvitation?.id, "refused invitation must remain traceable by ID");
    const refusalAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_REFUSED", subjectId: refusedInvitation.id }
    });
    assert.equal(refusalAuditCount, 1, "refusing an invitation must emit exactly one audit event");

    // Expiration is exposed as expired on read without mutating the invitation.
    // An explicit response attempt performs the terminal transition and records it.
    emailCount = SMTP_MESSAGES.length;
    const expireInvite = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(expireInvite, 202, "new invitation before expiration audit test");
    const expireToken = extractEmailToken(emailCount, "/recrutador/convite");
    const expiringInvitation = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, tokenHash: true }
    });
    assert.ok(expiringInvitation && expiringInvitation.tokenHash === digest(expireToken), "expiration test must target the current invitation token");
    await prisma.recruiterInvitation.update({
      where: { id: expiringInvitation.id },
      data: { expiresAt: new Date(Date.now() - 1000) }
    });

    const expiredListResponse = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: companyCookie },
      redirect: "manual"
    });
    const expiredListBody = await expectStatus(expiredListResponse, 200, "company lists an expired invitation");
    assert.ok(
      JSON.parse(expiredListBody).invitations.some(invitation => invitation.id === expiringInvitation.id && invitation.status === "EXPIRED"),
      "read-only invitation listing must present an expired pending invitation as EXPIRED"
    );
    const persistedBeforeExpirationTransition = await prisma.recruiterInvitation.findUnique({
      where: { id: expiringInvitation.id },
      select: { status: true }
    });
    assert.equal(persistedBeforeExpirationTransition?.status, "PENDING", "GET must not mutate the persisted invitation state");

    const expireResponse = await postJson("/api/recruiter/invitations/respond", {
      token: expireToken,
      action: "refuse"
    });
    await expectStatus(expireResponse, 400, "expired recruiter invitation cannot be answered");
    const expiredInvitation = await prisma.recruiterInvitation.findUnique({
      where: { id: expiringInvitation.id },
      select: { status: true }
    });
    assert.equal(expiredInvitation?.status, "EXPIRED", "explicit response to an expired invitation must persist the expired state");
    const expirationAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_EXPIRED", subjectId: expiringInvitation.id }
    });
    assert.equal(expirationAuditCount, 1, "expiring an invitation must emit exactly one audit event");

    // Re-link the recruiter to company A, then prove company B cannot terminate that link.
    emailCount = SMTP_MESSAGES.length;
    const relinkInvite = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(relinkInvite, 202, "new invitation before relinking");
    const relinkToken = extractEmailToken(emailCount, "/recrutador/convite");
    const relinkInvitation = await prisma.recruiterInvitation.findUnique({
      where: { tokenHash: digest(relinkToken) },
      select: { id: true }
    });
    assert.ok(relinkInvitation, "relink invitation must be stored before concurrent acceptance");
    const concurrentRelinkAccepts = await Promise.all([
      postJson("/api/recruiter/invitations/respond", {
        token: relinkToken,
        action: "accept"
      }, { cookie: recruiterCookie }),
      postJson("/api/recruiter/invitations/respond", {
        token: relinkToken,
        action: "accept"
      }, { cookie: recruiterCookie })
    ]);
    const relinkAcceptStatuses = concurrentRelinkAccepts.map(response => response.status).sort((a, b) => a - b);
    assert.equal(relinkAcceptStatuses.filter(status => status === 200).length, 1, "exactly one concurrent acceptance may succeed");
    assert.ok(
      relinkAcceptStatuses.every(status => status === 200 || status === 400 || status === 409),
      `concurrent acceptance must return success once and controlled conflicts otherwise; got ${relinkAcceptStatuses.join(",")}`
    );
    const activeLinkForIsolation = await prisma.recruiterLink.findFirst({
      where: { companyId: companyAccount.company.id, recruiterId: recruiterAccount.id, active: true },
      select: { id: true }
    });
    assert.ok(activeLinkForIsolation, "relinking must create a new active company link");
    const concurrentAcceptanceAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_ACCEPTED", subjectId: relinkInvitation.id }
    });
    assert.equal(concurrentAcceptanceAuditCount, 1, "concurrent acceptance must emit exactly one audit event");
    const activeRecruiterLinkCount = await prisma.recruiterLink.count({
      where: { recruiterId: recruiterAccount.id, active: true }
    });
    assert.equal(activeRecruiterLinkCount, 1, "concurrent acceptance must leave exactly one active company link");

    const secondCompanyEmailCount = SMTP_MESSAGES.length;
    const secondCompanyRegistration = await postJson("/api/auth/register/company", {
      legalName: "Segunda Empresa de Teste E2E",
      tradeName: "Empresa E2E Dois",
      officialId: "98765432000198",
      contactEmail: SECOND_COMPANY_EMAIL,
      password: COMPANY_PASSWORD
    });
    await expectStatus(secondCompanyRegistration, 201, "second company registration");
    const secondCompanyAccount = await prisma.user.findUnique({
      where: { email: SECOND_COMPANY_EMAIL },
      select: { id: true, isActive: true, company: { select: { id: true } } }
    });
    assert.ok(secondCompanyAccount?.company && !secondCompanyAccount.isActive, "second company must remain inactive until verification");
    const secondCompanyToken = extractEmailToken(secondCompanyEmailCount, "/empresa/confirmar-email");
    const verifySecondCompany = await postJson("/api/auth/company/verify-email", { token: secondCompanyToken });
    await expectStatus(verifySecondCompany, 200, "second company email verification");

    const secondCompanyLogin = await postJson("/api/auth/login", {
      profile: "company",
      identifier: SECOND_COMPANY_EMAIL,
      password: COMPANY_PASSWORD,
      rememberMe: false
    });
    await expectStatus(secondCompanyLogin, 200, "second company login");
    const secondCompanyCookieMatch = (secondCompanyLogin.headers.get("set-cookie") || "").match(/(?:^|,\s*)acessa_session=([^;]+)/);
    assert.ok(secondCompanyCookieMatch?.[1], "second company login must issue a session cookie");
    const secondCompanyCookie = `acessa_session=${secondCompanyCookieMatch[1]}`;

    // An active recruiter cannot be invited into a second company until the
    // existing organizational link is ended.
    const secondCompanyInviteActiveRecruiter = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: secondCompanyCookie });
    const activeLinkInviteFailure = await expectStatus(
      secondCompanyInviteActiveRecruiter,
      202,
      "second company invitation response must not disclose recipient eligibility"
    );
    assert.equal(
      JSON.parse(activeLinkInviteFailure).message,
      "Se os dados corresponderem a um recrutador elegível, as instruções serão enviadas ao e-mail informado.",
      "invitation response must be generic for an ineligible recipient"
    );
    const forbiddenSecondCompanyInvitation = await prisma.recruiterInvitation.findFirst({
      where: { companyId: secondCompanyAccount.company.id, recipientUserId: recruiterAccount.id },
      select: { id: true }
    });
    assert.equal(forbiddenSecondCompanyInvitation, null, "eligibility-neutral placeholder must not create an actionable cross-company invitation");

    const secondCompanyInvitationsResponse = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: secondCompanyCookie },
      redirect: "manual"
    });
    const secondCompanyInvitationsBody = await expectStatus(secondCompanyInvitationsResponse, 200, "company B lists the neutral invitation request");
    const neutralRequest = JSON.parse(secondCompanyInvitationsBody).invitations.find((item) => item.recipient.email === RECRUITER_EMAIL);
    assert.equal(neutralRequest?.status, "PENDING", "the company-facing list must show a neutral pending row without linking the existing recruiter");
    assert.equal(neutralRequest?.recipient.fullName, "Recrutador de Teste E2E", "the neutral row uses only the name submitted by the company");

    const forbiddenSecondCompanyInviteAuditCount = await prisma.auditEvent.count({
      where: { actorUserId: secondCompanyAccount.id, eventType: "RECRUITER_INVITATION_SENT" }
    });
    assert.equal(forbiddenSecondCompanyInviteAuditCount, 0, "rejected cross-company invitation must not create a sent-invitation audit event");

    const secondCompanyLinksResponse = await fetch(`${BASE_URL}/api/company/recruiter-links`, {
      headers: { cookie: secondCompanyCookie },
      redirect: "manual"
    });
    const secondCompanyLinksBody = await expectStatus(secondCompanyLinksResponse, 200, "second company recruiter links list");
    assert.ok(
      JSON.parse(secondCompanyLinksBody).links.every(link => link.recruiter.email !== RECRUITER_EMAIL),
      "company B must not see company A's recruiter link"
    );

    // Company B must not cancel a pending invitation owned by company A.
    emailCount = SMTP_MESSAGES.length;
    const crossCompanyCancelInvite = await postJson("/api/company/recruiter-invitations", {
      email: CROSS_COMPANY_INVITATION_EMAIL,
      fullName: "Recrutador de Teste de Isolamento"
    }, { cookie: companyCookie });
    await expectStatus(crossCompanyCancelInvite, 202, "company A creates invitation for cross-company cancellation test");
    const crossCompanyCancelToken = extractEmailToken(emailCount, "/recrutador/convite");
    const crossCompanyInvitationRecipient = await prisma.user.findUnique({
      where: { email: CROSS_COMPANY_INVITATION_EMAIL },
      select: { id: true }
    });
    assert.ok(crossCompanyInvitationRecipient, "cross-company invitation recipient account must exist");
    const crossCompanyPending = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: crossCompanyInvitationRecipient.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, tokenHash: true }
    });
    assert.ok(crossCompanyPending && crossCompanyPending.tokenHash === digest(crossCompanyCancelToken), "cross-company cancellation test invitation must be pending for company A");

    const companyAInvitationsResponse = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: companyCookie },
      redirect: "manual"
    });
    const companyAInvitationsBody = await expectStatus(companyAInvitationsResponse, 200, "company A lists its recruiter invitations");
    assert.ok(
      JSON.parse(companyAInvitationsBody).invitations.some(invitation => invitation.id === crossCompanyPending.id),
      "company A must see its own pending invitation"
    );
    const companyBInvitationsResponse = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: secondCompanyCookie },
      redirect: "manual"
    });
    const companyBInvitationsBody = await expectStatus(companyBInvitationsResponse, 200, "company B lists its recruiter invitations");
    assert.ok(
      JSON.parse(companyBInvitationsBody).invitations.every(invitation => invitation.id !== crossCompanyPending.id),
      "company B must not see company A's pending invitation"
    );
    const invitationSentAuditCount = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_SENT", subjectId: crossCompanyPending.id }
    });
    assert.equal(invitationSentAuditCount, 1, "sending an invitation must create exactly one audit event");

    const invitationCancelAuditBefore = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_CANCELLED", subjectId: crossCompanyPending.id }
    });
    const crossCompanyCancel = await postJson("/api/company/recruiter-invitations/cancel", {
      invitationId: crossCompanyPending.id
    }, { cookie: secondCompanyCookie });
    await expectStatus(crossCompanyCancel, 409, "company B cannot cancel company A invitation");
    const invitationAfterCrossCompanyCancel = await prisma.recruiterInvitation.findUnique({
      where: { id: crossCompanyPending.id },
      select: { status: true }
    });
    assert.equal(invitationAfterCrossCompanyCancel?.status, "PENDING", "cross-company cancellation attempt must not change invitation state");
    const invitationCancelAuditAfter = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_INVITATION_CANCELLED", subjectId: crossCompanyPending.id }
    });
    assert.equal(invitationCancelAuditAfter, invitationCancelAuditBefore, "rejected cross-company cancellation must not create an audit event");

    const linkEndAuditBefore = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_LINK_ENDED", subjectId: activeLinkForIsolation.id }
    });
    const crossCompanyEnd = await postJson("/api/company/recruiter-links/end", {
      recruiterLinkId: activeLinkForIsolation.id
    }, { cookie: secondCompanyCookie });
    await expectStatus(crossCompanyEnd, 409, "second company cannot terminate another company's recruiter link");
    const stillActiveLink = await prisma.recruiterLink.findUnique({
      where: { id: activeLinkForIsolation.id },
      select: { active: true }
    });
    assert.equal(stillActiveLink?.active, true, "cross-company termination attempt must not change the link");
    const linkEndAuditAfterCrossCompanyAttempt = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_LINK_ENDED", subjectId: activeLinkForIsolation.id }
    });
    assert.equal(
      linkEndAuditAfterCrossCompanyAttempt,
      linkEndAuditBefore,
      "a rejected cross-company termination must not create an audit event"
    );

    const concurrentEndResponses = await Promise.all([
      postJson("/api/company/recruiter-links/end", { recruiterLinkId: activeLinkForIsolation.id }, { cookie: companyCookie }),
      postJson("/api/company/recruiter-links/end", { recruiterLinkId: activeLinkForIsolation.id }, { cookie: companyCookie })
    ]);
    assert.deepEqual(
      concurrentEndResponses.map(response => response.status).sort((a, b) => a - b),
      [200, 409],
      "exactly one concurrent request may terminate the same active recruiter link"
    );
    const linkEndAuditAfterConcurrentRequests = await prisma.auditEvent.count({
      where: { eventType: "RECRUITER_LINK_ENDED", subjectId: activeLinkForIsolation.id }
    });
    assert.equal(
      linkEndAuditAfterConcurrentRequests,
      1,
      "concurrent termination must emit exactly one audit event"
    );
    const finalPreservedRecruiter = await prisma.user.findUnique({
      where: { id: recruiterAccount.id },
      select: { id: true, isActive: true }
    });
    const finalEndedLink = await prisma.recruiterLink.findUnique({
      where: { id: activeLinkForIsolation.id },
      select: { active: true, endedAt: true }
    });
    assert.ok(finalPreservedRecruiter?.isActive && finalEndedLink && !finalEndedLink.active && finalEndedLink.endedAt, "link termination must preserve the recruiter account and end only the owning company's link");

    // SPEC-004: company accessibility infrastructure.
    const infraUrl = `${BASE_URL}/api/company/infraestrutura`;
    const infraCodes = ["RAMPS", "ELEVATORS", "ADAPTED_RESTROOMS", "SIGNAGE", "SCREEN_READERS", "INCLUSIVE_POLICIES"];
    const putInfra = (payload, headers = {}) => fetch(infraUrl, {
      method: "PUT",
      headers: { "content-type": "application/json", "x-forwarded-for": TEST_IP, origin: PUBLIC_URL, ...headers },
      body: JSON.stringify(payload), redirect: "manual"
    });
    await expectStatus(await fetch(infraUrl, { redirect: "manual" }), 401, "anonymous infrastructure read");
    await expectStatus(await putInfra({ answers: {} }), 401, "anonymous infrastructure save");
    const anonymousInfraPage = await fetch(`${BASE_URL}/empresa/infraestrutura`, { redirect: "manual" });
    assert.ok([302, 303, 307].includes(anonymousInfraPage.status), "anonymous infrastructure page must redirect to login");
    await expectStatus(await fetch(`${BASE_URL}/empresa/infraestrutura`, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, "company infrastructure page");

    const emptyInfra = JSON.parse(await expectStatus(await fetch(infraUrl, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, "company reads empty infrastructure"));
    assert.ok(infraCodes.every(code => emptyInfra.answers[code].status === "NOT_INFORMED"), "unregistered items must stay NOT_INFORMED");
    const completeAnswers = Object.fromEntries(infraCodes.map(code => [code, { status: "PRESENT", note: "" }]));
    const incomplete = { ...completeAnswers };
    delete incomplete.SIGNAGE;
    const incompleteResponse = await putInfra({ answers: incomplete }, { cookie: companyCookie });
    const incompleteBody = JSON.parse(await expectStatus(incompleteResponse, 400, "pending required item blocks saving"));
    assert.deepEqual(Object.keys(incompleteBody.issues), ["SIGNAGE"], "the pending item must be identified");
    await expectStatus(await putInfra({ answers: completeAnswers }, { cookie: companyCookie, origin: "https://evil.example" }), 403, "cross-origin infrastructure save");
    await expectStatus(await putInfra({ answers: completeAnswers, companyId: "another-company" }, { cookie: companyCookie }), 400, "body cannot choose the company");
    assert.equal(await prisma.companyInfrastructure.count({ where: { companyId: companyAccount.company.id } }), 0, "rejected saves must not persist data");
    const answersToSave = { ...completeAnswers, ELEVATORS: { status: "ABSENT", note: "Prédio de um andar" } };
    await expectStatus(await putInfra({ answers: answersToSave }, { cookie: companyCookie }), 200, "company saves infrastructure");
    const savedInfra = JSON.parse(await expectStatus(await fetch(infraUrl, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, "company reads saved infrastructure"));
    assert.deepEqual(savedInfra.answers.ELEVATORS, { status: "ABSENT", note: "Prédio de um andar" });
    assert.equal(await prisma.companyInfrastructure.count({ where: { companyId: companyAccount.company.id } }), 1);
    await expectStatus(await putInfra({ answers: { ...answersToSave, RAMPS: { status: "ABSENT", note: "" } } }, { cookie: companyCookie }), 200, "company updates infrastructure");
    const infraAudit = await prisma.auditEvent.findMany({
      where: { actorUserId: companyAccount.id, eventType: { startsWith: "COMPANY_INFRASTRUCTURE" } }, select: { eventType: true, metadata: true }
    });
    assert.deepEqual(infraAudit.map(event => event.eventType).sort(), ["COMPANY_INFRASTRUCTURE_CREATED", "COMPANY_INFRASTRUCTURE_UPDATED"]);
    assert.ok(!JSON.stringify(infraAudit).includes("Prédio de um andar"), "audit events must not contain declared notes");

    // SPEC-005: own jobs management.
    const jobsUrl = `${BASE_URL}/api/vagas`;
    const jobHeaders = (cookie, extra = {}) => ({ "content-type": "application/json", "x-forwarded-for": TEST_IP, origin: PUBLIC_URL, cookie, ...extra });
    const sendJob = (url, method, payload, cookie, extra = {}) => fetch(url, { method, headers: jobHeaders(cookie, extra), body: payload === undefined ? undefined : JSON.stringify(payload), redirect: "manual" });
    await expectStatus(await fetch(jobsUrl, { redirect: "manual" }), 401, "anonymous jobs list");
    await expectStatus(await sendJob(jobsUrl, "POST", {}, recruiterCookie), 403, "recruiter without active link cannot create jobs");
    for (const path of ["/empresa/vagas", "/empresa/vagas/nova", "/empresa/configuracoes"]) {
      const anonymousPage = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
      assert.ok([302, 303, 307].includes(anonymousPage.status), `${path} must redirect anonymous visitors`);
      await expectStatus(await fetch(`${BASE_URL}${path}`, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, `company page ${path}`);
    }
    await expectStatus(await sendJob(jobsUrl, "POST", { title: "x" }, companyCookie, { origin: "https://evil.example" }), 403, "cross-origin job creation");
    await expectStatus(await sendJob(jobsUrl, "POST", { title: "x", companyId: "other" }, companyCookie), 400, "body cannot choose the company of a job");
    const secretTitle = "Titulo confidencial E2E";
    const draftResponse = await sendJob(jobsUrl, "POST", { title: secretTitle }, companyCookie);
    const draftJob = JSON.parse(await expectStatus(draftResponse, 201, "company creates an incomplete draft")).job;
    assert.equal(draftJob.status, "DRAFT");
    await expectStatus(await fetch(`${jobsUrl}/${draftJob.id}`, { headers: { cookie: secondCompanyCookie }, redirect: "manual" }), 404, "another company cannot read the job");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}`, "PUT", { title: "invasao" }, secondCompanyCookie), 404, "another company cannot edit the job");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "close" }, secondCompanyCookie), 404, "another company cannot act on the job");
    const blockedPublish = JSON.parse(await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "publish" }, companyCookie), 400, "incomplete draft cannot be published"));
    assert.ok(blockedPublish.issues.description && blockedPublish.issues["accessibility.RAMPS"], "publication issues must list missing fields");
    const futureDeadline = `${new Date().getUTCFullYear() + 1}-12-31`;
    const jobBody = {
      title: secretTitle, description: "Descricao", requirements: "Requisitos", modality: "HIBRIDO", locationCity: "Recife", locationState: "PE",
      deadline: futureDeadline, accessibility: Object.fromEntries(infraCodes.map(code => [code, code === "RAMPS" ? "PRESENT" : "NOT_INFORMED"]))
    };
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}`, "PUT", { ...jobBody, deadline: "2020-01-01" }, companyCookie), 200, "drafts accept any deadline");
    const pastDeadline = JSON.parse(await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "publish" }, companyCookie), 400, "past deadline blocks publication"));
    assert.ok(pastDeadline.issues.deadline, "past deadline must be reported");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}`, "PUT", jobBody, companyCookie), 200, "company completes the draft");
    const published = JSON.parse(await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "publish" }, companyCookie), 200, "company publishes the job"));
    assert.equal(published.job.status, "OPEN");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "publish" }, companyCookie), 409, "published job cannot be published again");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}`, "PUT", { ...jobBody, title: "" }, companyCookie), 400, "published job must remain publishable");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "pause" }, companyCookie), 200, "company pauses the job");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "reopen" }, companyCookie), 200, "company reopens the job");
    const listedJobs = JSON.parse(await expectStatus(await fetch(`${jobsUrl}?status=OPEN`, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, "company lists open jobs"));
    assert.equal(listedJobs.jobs.length, 1);
    assert.equal(listedJobs.counts.OPEN, 1);
    const otherList = JSON.parse(await expectStatus(await fetch(jobsUrl, { headers: { cookie: secondCompanyCookie }, redirect: "manual" }), 200, "other company lists its own jobs"));
    assert.equal(otherList.jobs.length, 0, "jobs must not leak across companies");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "close" }, companyCookie), 200, "company closes the job");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}`, "PUT", jobBody, companyCookie), 409, "closed job cannot be edited");
    await expectStatus(await sendJob(`${jobsUrl}/${draftJob.id}/acao`, "POST", { action: "reopen" }, companyCookie), 409, "closed job cannot be reopened");
    const jobAudit = await prisma.auditEvent.findMany({ where: { subjectType: "Job", subjectId: draftJob.id }, select: { eventType: true, metadata: true } });
    for (const type of ["JOB_CREATED", "JOB_UPDATED", "JOB_PUBLISHED", "JOB_PAUSED", "JOB_REOPENED", "JOB_CLOSED"]) {
      assert.ok(jobAudit.some(event => event.eventType === type), `audit must record ${type}`);
    }
    assert.ok(!JSON.stringify(jobAudit).includes(secretTitle) && !JSON.stringify(jobAudit).includes("Recife"), "job audit events must not contain job content");

    // SPEC-003: interface preferences saved in the account and the skip link.
    const prefsUrl = `${BASE_URL}/api/conta/preferencias`;
    const sendPrefs = (payload, cookie, extra = {}) => fetch(prefsUrl, { method: "PUT", headers: { "content-type": "application/json", "x-forwarded-for": TEST_IP, origin: PUBLIC_URL, cookie, ...extra }, body: JSON.stringify(payload), redirect: "manual" });
    await expectStatus(await fetch(prefsUrl, { redirect: "manual" }), 401, "anonymous preferences read");
    await expectStatus(await sendPrefs({ preferences: { HIGH_CONTRAST: "ON" } }, ""), 401, "anonymous preferences save");
    const defaultPrefs = JSON.parse(await expectStatus(await fetch(prefsUrl, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, "default preferences"));
    assert.equal(defaultPrefs.preferences.HIGH_CONTRAST, "AUTO");
    await expectStatus(await sendPrefs({ preferences: { HIGH_CONTRAST: "MAYBE" } }, companyCookie), 400, "invalid preference value");
    await expectStatus(await sendPrefs({ preferences: { HIGH_CONTRAST: "ON" }, userId: "other" }, companyCookie), 400, "body cannot choose the user");
    await expectStatus(await sendPrefs({ preferences: { HIGH_CONTRAST: "ON" } }, companyCookie, { origin: "https://evil.example" }), 403, "cross-origin preference save");
    await expectStatus(await sendPrefs({ preferences: { HIGH_CONTRAST: "ON" } }, companyCookie), 200, "company saves high contrast");
    const savedPrefs = JSON.parse(await expectStatus(await fetch(prefsUrl, { headers: { cookie: companyCookie }, redirect: "manual" }), 200, "saved preferences"));
    assert.equal(savedPrefs.preferences.HIGH_CONTRAST, "ON");
    const otherPrefs = JSON.parse(await expectStatus(await fetch(prefsUrl, { headers: { cookie: secondCompanyCookie }, redirect: "manual" }), 200, "other account preferences"));
    assert.equal(otherPrefs.preferences.HIGH_CONTRAST, "AUTO", "preferences must not leak across accounts");
    const prefsAudit = await prisma.auditEvent.findMany({ where: { actorUserId: companyAccount.id, eventType: "ACCESSIBILITY_PREFERENCES_UPDATED" }, select: { metadata: true } });
    assert.equal(prefsAudit.length, 1);
    assert.deepEqual(prefsAudit[0].metadata, { changedPreferences: ["HIGH_CONTRAST"] });
    const loginHtml = await (await fetch(`${BASE_URL}/empresa/login`, { redirect: "manual" })).text();
    assert.ok(loginHtml.includes("Pular para o conteúdo principal"), "pages must start with the skip link");

    // SPEC-007: compatibility calculation (critical lock, A/T/D, HERE through a local stand-in, immutable history).
    const compatUrl = `${BASE_URL}/api/candidato/compatibilidade`;
    const candidateLogin = await postJson("/api/auth/login", { profile: "candidate", identifier: EMAIL, password: NEW_PASSWORD, rememberMe: false });
    await expectStatus(candidateLogin, 200, "candidate login for compatibility");
    const compatCookie = `acessa_session=${(candidateLogin.headers.get("set-cookie") || "").match(/(?:^|,\s*)acessa_session=([^;]+)/)[1]}`;
    const sendCompat = (payload, cookie, extra = {}) => fetch(compatUrl, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": TEST_IP, origin: PUBLIC_URL, cookie, ...extra }, body: JSON.stringify(payload), redirect: "manual" });
    const sendJobApi = (url, method, payload, cookie) => fetch(url, { method, headers: { "content-type": "application/json", "x-forwarded-for": TEST_IP, origin: PUBLIC_URL, cookie }, body: JSON.stringify(payload), redirect: "manual" });

    const compatJobBody = {
      title: "Analista de dados E2E", description: "Descricao", requirements: "Requisitos", modality: "PRESENCIAL", locationCity: "São Paulo", locationState: "SP",
      locationAddress: "Avenida Paulista, 1000", deadline: `${new Date().getUTCFullYear() + 1}-12-31`,
      accessibility: Object.fromEntries(infraCodes.map(code => [code, "PRESENT"])),
      technicalCriteria: { skills: ["sql"], experience: [], educationMinLevel: "", languages: [] }
    };
    const compatJob = JSON.parse(await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas`, "POST", compatJobBody, companyCookie), 201, "company creates a job with technical criteria")).job;
    assert.deepEqual(compatJob.technicalCriteria.skills, ["sql"], "technical criteria must round-trip");
    await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas/${compatJob.id}/acao`, "POST", { action: "publish" }, companyCookie), 200, "company publishes the job to be analyzed");

    await expectStatus(await sendCompat({ jobId: compatJob.id }, ""), 401, "anonymous compatibility");
    await expectStatus(await sendCompat({ jobId: compatJob.id }, companyCookie), 401, "company cannot request a candidate analysis");
    await expectStatus(await fetch(`${BASE_URL}/api/candidato/vagas`, { headers: { cookie: companyCookie }, redirect: "manual" }), 401, "company cannot list candidate jobs");
    await expectStatus(await sendCompat({ jobId: compatJob.id, candidateUserId: "other" }, compatCookie), 400, "body cannot choose the candidate");
    await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie, { origin: "https://evil.example" }), 403, "cross-origin compatibility request");
    await expectStatus(await sendCompat({ jobId: "does-not-exist" }, compatCookie), 404, "unknown job");
    const openJobs = JSON.parse(await expectStatus(await fetch(`${BASE_URL}/api/candidato/vagas`, { headers: { cookie: compatCookie }, redirect: "manual" }), 200, "candidate lists published jobs"));
    assert.ok(openJobs.jobs.some(job => job.id === compatJob.id), "published job must be listed");
    await expectStatus(await fetch(`${BASE_URL}/candidato/compatibilidade`, { headers: { cookie: compatCookie }, redirect: "manual" }), 200, "candidate compatibility page");

    const compatProfile = {
      education: [], languages: [], professionalExperience: [], courses: ["Curso de SQL"], certifications: [], professionalLinks: [],
      workPreferences: { modalities: ["Presencial"], city: "São Paulo", state: "SP", address: "Rua Reservada, 55", transportMode: "Ônibus" },
      accessibilityDeclaration: "NO_NEEDS_DECLARED", accessibilityNeeds: [], accessibilityNeedOptionCodes: [], essentialAccessibilityResources: []
    };
    const saveCompatProfile = payload => fetch(`${BASE_URL}/api/candidato/perfil`, { method: "PUT", headers: { "content-type": "application/json", "x-forwarded-for": TEST_IP, origin: PUBLIC_URL, cookie: compatCookie }, body: JSON.stringify(payload), redirect: "manual" });
    await expectStatus(await saveCompatProfile(compatProfile), 200, "candidate prepares the profile for analysis");

    const complete = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "candidate analyzes a job")).result;
    assert.equal(complete.status, "COMPLETE");
    assert.equal(complete.score, 100, "full match with a 30-minute trip must score 100");
    assert.equal(complete.dimensions.A.status, "NOT_APPLICABLE");
    assert.equal(complete.dimensions.D.components.find(c => c.label === "Deslocamento").score, 100);
    const transitCall = HERE_REQUESTS.find(request => request.path === "/transit");
    assert.ok(transitCall && transitCall.key === HERE_KEY && transitCall.params.modes.includes("bus"), "bus trips must use the transit service with bus modes");
    const walking = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id, transportMode: "Caminhada" }, compatCookie), 201, "candidate overrides the transport mode for one job")).result;
    assert.notEqual(walking.id, complete.id, "a recalculation must create a new record");
    assert.ok(HERE_REQUESTS.some(request => request.path === "/router" && request.params.transportMode === "pedestrian"), "walking must use the routing service");
    const profileAfterOverride = JSON.parse(await expectStatus(await fetch(`${BASE_URL}/api/candidato/perfil`, { headers: { cookie: compatCookie }, redirect: "manual" }), 200, "profile after override"));
    assert.equal(profileAfterOverride.profile.workPreferences.transportMode, "Ônibus", "the override must not change the profile");
    await expectStatus(await sendCompat({ jobId: compatJob.id, transportMode: "Foguete" }, compatCookie), 400, "invalid transport mode");
    const stored = await prisma.compatibilityResult.findMany({ where: { jobId: compatJob.id }, orderBy: { executedAt: "asc" } });
    assert.equal(stored.length, 2, "every calculation must be stored as its own record");
    assert.ok(!JSON.stringify(stored).includes("Reservada") && !JSON.stringify(stored).includes("Avenida Paulista"), "stored history must not copy addresses");
    await assert.rejects(prisma.$executeRaw`UPDATE "CompatibilityResult" SET "score" = 1 WHERE "id" = ${stored[0].id}`, "stored results must be immutable");
    const latest = JSON.parse(await expectStatus(await fetch(`${compatUrl}?jobId=${compatJob.id}`, { headers: { cookie: compatCookie }, redirect: "manual" }), 200, "candidate reads the latest result"));
    assert.equal(latest.result.id, walking.id);
    await expectStatus(await fetch(`${compatUrl}?jobId=${compatJob.id}`, { headers: { cookie: companyCookie }, redirect: "manual" }), 401, "company cannot read candidate results");

    // A provider failure never becomes a zero or an invented travel time.
    await expectStatus(await saveCompatProfile({ ...compatProfile, workPreferences: { ...compatProfile.workPreferences, address: "Rua QUOTA, 1" } }), 200, "candidate address that makes the stand-in fail");
    const failed = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "analysis with provider failure")).result;
    assert.equal(failed.status, "INSUFFICIENT_DATA");
    assert.equal(failed.score, null);
    await expectStatus(await saveCompatProfile(compatProfile), 200, "restore profile address");

    // Safety cap: once this month's geocoding count reaches 60% of the free allowance, no request reaches HERE.
    const usageMonth = new Date().toISOString().slice(0, 7);
    const geocodeUsage = await prisma.hereUsage.findUnique({ where: { month_service: { month: usageMonth, service: "geocode" } } });
    assert.ok(geocodeUsage && geocodeUsage.count > 0, "requests sent to HERE must be counted per month and service");
    try {
      await prisma.hereUsage.update({ where: { month_service: { month: usageMonth, service: "geocode" } }, data: { count: 18000 } });
      const requestsBeforeCap = HERE_REQUESTS.length;
      const capped = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "analysis after the safety cap")).result;
      assert.equal(capped.status, "INSUFFICIENT_DATA", "a reached cap must not invent a travel time");
      assert.ok(JSON.stringify(capped).includes("limite de segurança"), "the reason must explain the safety cap");
      assert.equal(HERE_REQUESTS.length, requestsBeforeCap, "a reached cap must not send requests to HERE");
    } finally {
      await prisma.hereUsage.update({ where: { month_service: { month: usageMonth, service: "geocode" } }, data: { count: geocodeUsage.count } });
    }

    // The candidate marks a declared need as indispensable: a job declaring that resource absent is incompatible.
    await expectStatus(await saveCompatProfile({ ...compatProfile, mandatoryNeedOptionCodes: ["A01"] }), 400, "indispensable need must be among the selected needs");
    const rampBefore = await prisma.accessibilityNeedOption.findUnique({ where: { code: "A01" } });
    await prisma.accessibilityNeedOption.update({ where: { code: "A01" }, data: { isMandatory: false } });
    try {
    await expectStatus(await saveCompatProfile({ ...compatProfile, accessibilityDeclaration: "NEEDS_DECLARED", accessibilityNeedOptionCodes: ["A01"], mandatoryNeedOptionCodes: ["A01"] }), 200, "candidate marks the ramp as indispensable");
    await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas/${compatJob.id}`, "PUT", { ...compatJobBody, accessibility: { ...compatJobBody.accessibility, RAMPS: "ABSENT" } }, companyCookie), 200, "company declares no ramps (candidate-marked lock)");
    const candidateLocked = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "analysis with a candidate-marked barrier")).result;
    assert.equal(candidateLocked.status, "INCOMPATIBLE", "a need marked indispensable by the candidate must lock the job");
    await expectStatus(await saveCompatProfile({ ...compatProfile, accessibilityDeclaration: "NEEDS_DECLARED", accessibilityNeedOptionCodes: ["A01"] }), 200, "candidate unmarks the ramp");
    const softened = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "analysis without the indispensable mark")).result;
    assert.notEqual(softened.status, "INCOMPATIBLE", "without the mark an absent ramp only lowers the accessibility score");
    await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas/${compatJob.id}`, "PUT", compatJobBody, companyCookie), 200, "restore job accessibility");
    } finally {
      await prisma.accessibilityNeedOption.update({ where: { code: "A01" }, data: { isMandatory: rampBefore.isMandatory } });
    }
    await expectStatus(await saveCompatProfile(compatProfile), 200, "restore profile after candidate-marked lock");

    // Critical lock: a mandatory need meeting a declared barrier makes the job incompatible and spends no provider call.
    const rampOption = await prisma.accessibilityNeedOption.findUnique({ where: { code: "A01" } });
    assert.ok(rampOption, "catalog must contain A01");
    try {
      await prisma.accessibilityNeedOption.update({ where: { code: "A01" }, data: { isMandatory: true } });
      await expectStatus(await saveCompatProfile({ ...compatProfile, accessibilityDeclaration: "NEEDS_DECLARED", accessibilityNeedOptionCodes: ["A01"] }), 200, "candidate declares the ramp need");
      await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas/${compatJob.id}`, "PUT", { ...compatJobBody, accessibility: { ...compatJobBody.accessibility, RAMPS: "ABSENT" } }, companyCookie), 200, "company declares no ramps");
      const callsBefore = HERE_REQUESTS.length;
      const locked = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "analysis with a critical barrier")).result;
      assert.equal(locked.status, "INCOMPATIBLE");
      assert.equal(locked.score, null);
      assert.equal(HERE_REQUESTS.length, callsBefore, "a critical barrier must not spend a route request");
      await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas/${compatJob.id}`, "PUT", { ...compatJobBody, accessibility: { ...compatJobBody.accessibility, RAMPS: "NOT_INFORMED" } }, companyCookie), 200, "company leaves the ramp item uninformed");
      const unknown = JSON.parse(await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 201, "analysis with an uninformed item")).result;
      assert.equal(unknown.status, "INSUFFICIENT_DATA", "an uninformed item must not create a barrier nor presume compatibility");
    } finally {
      await prisma.accessibilityNeedOption.update({ where: { code: "A01" }, data: { isMandatory: rampOption.isMandatory } });
    }
    await expectStatus(await sendJobApi(`${BASE_URL}/api/vagas/${compatJob.id}/acao`, "POST", { action: "close" }, companyCookie), 200, "company closes the analyzed job");
    await expectStatus(await sendCompat({ jobId: compatJob.id }, compatCookie), 404, "closed jobs are not analyzed");

    // Logout must revoke the server-side session, not merely clear the browser cookie.
    const companySessionsBeforeLogout = await prisma.session.count({ where: { userId: companyAccount.id } });
    assert.equal(companySessionsBeforeLogout, 1, "company login must have one active session before logout");
    const logout = await postJson("/api/auth/logout", {}, { cookie: companyCookie });
    await expectStatus(logout, 303, "company logout");
    const companySessionsAfterLogout = await prisma.session.count({ where: { userId: companyAccount.id } });
    assert.equal(companySessionsAfterLogout, 0, "logout must revoke the server-side session");
    const protectedAfterLogout = await fetch(`${BASE_URL}/api/company/recruiter-invitations`, {
      headers: { cookie: companyCookie },
      redirect: "manual"
    });
    await expectStatus(protectedAfterLogout, 401, "revoked session must not access protected company API");

    // Exercise the approved ten-consecutive-failure account lockout using an isolated IP
    // so the IP-level progressive throttling does not mask the account-level behavior.
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const failedLogin = await postJson("/api/auth/login", {
        profile: "candidate",
        identifier: EMAIL,
        password: "DefinitelyWrongPassword123",
        rememberMe: false
      }, { "x-forwarded-for": LOCKOUT_TEST_IP });
      await expectStatus(failedLogin, 401, `account lockout failure ${attempt}`);
    }
    const lockedAccountLogin = await postJson("/api/auth/login", {
      profile: "candidate",
      identifier: EMAIL,
      password: NEW_PASSWORD,
      rememberMe: false
    }, { "x-forwarded-for": LOCKOUT_TEST_IP });
    await expectStatus(lockedAccountLogin, 401, "correct password remains blocked after ten consecutive failures");
    const lockedCandidate = await prisma.user.findUnique({
      where: { email: EMAIL },
      select: { lockedUntil: true, failedLoginCount: true }
    });
    assert.ok(lockedCandidate?.lockedUntil && lockedCandidate.lockedUntil > new Date(), "ten consecutive failures must persist an active account lock");
    assert.equal(lockedCandidate.failedLoginCount, 0, "the locked account counter is reset after the threshold is reached");

    process.stdout.write("Auth E2E passed: candidate email/CPF login and recovery; own jobs lifecycle and isolation; account accessibility preferences; compatibility calculation; company verification and password recovery; recruiter invitation/resend/accept/refuse/cancel; multi-company isolation and concurrency; logout; account lockout.\n");
  } finally {
    try {
      await cleanupTestData();
    } catch (error) {
      process.stderr.write(`E2E cleanup warning: ${error instanceof Error ? error.message : String(error)}\n`);
    }

    if (app && app.exitCode === null && !app.killed) {
      app.kill("SIGTERM");
      await Promise.race([
        new Promise(resolve => app.once("exit", resolve)),
        delay(5000)
      ]);
      if (app.exitCode === null) app.kill("SIGKILL");
    }
    for (const socket of SMTP_SOCKETS) socket.destroy();
    if (smtpServer) await new Promise(resolve => smtpServer.close(() => resolve()));
    if (hereServer) await new Promise(resolve => hereServer.close(() => resolve()));
    await prisma.$disconnect();
    if (appSpawnError) throw appSpawnError;
    if (appExit && appExit.code !== 0 && appExit.signal !== "SIGTERM") {
      process.stderr.write(`Next.js exited with ${JSON.stringify(appExit)}.\n${appOutput}\n`);
    }
  }
}

main().catch(error => {
  process.stderr.write(`Auth E2E failed: ${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exitCode = 1;
});
