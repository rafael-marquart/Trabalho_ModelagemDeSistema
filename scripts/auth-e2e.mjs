import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer as createSmtpServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = Number(process.env.AUTH_E2E_PORT || "3187");
const SMTP_PORT = Number(process.env.AUTH_E2E_SMTP_PORT || "2527");
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PUBLIC_URL = `https://127.0.0.1:${PORT}`;
const TEST_IP = "192.0.2.77";
const LOCKOUT_TEST_IP = "198.51.100.42";
const EMAIL = `spec001-e2e-${randomUUID()}@example.test`;
const COMPANY_EMAIL = `spec001-company-${randomUUID()}@example.test`;
const RECRUITER_EMAIL = `spec001-recruiter-${randomUUID()}@example.test`;
const SECOND_COMPANY_EMAIL = `spec001-company-two-${randomUUID()}@example.test`;
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
    where: { email: { in: [EMAIL, COMPANY_EMAIL, RECRUITER_EMAIL, SECOND_COMPANY_EMAIL] } },
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
      where: { OR: [{ actorUserId: { in: userIds } }, { subjectId: { in: auditSubjectIds } }] }
    });
    await tx.company.deleteMany({ where: { id: { in: companyIds } } });
    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  });
}

async function main() {
  let smtpServer;
  let appExit;
  try {
    await prisma.$connect();
    smtpServer = await startTestSmtp();

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

    const companyLogin = await postJson("/api/auth/login", {
      profile: "company",
      identifier: COMPANY_EMAIL,
      password: COMPANY_PASSWORD,
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
    await expectStatus(invite, 201, "recruiter invitation");
    const firstInvitationToken = extractEmailToken(emailCount, "/recrutador/convite");

    emailCount = SMTP_MESSAGES.length;
    const resend = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(resend, 200, "recruiter invitation resend");
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

    const endInitialLink = await postJson("/api/company/recruiter-links/end", { recruiterLinkId: activeLink.id }, { cookie: companyCookie });
    await expectStatus(endInitialLink, 200, "company ends its own recruiter link");
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
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(cancelInvite, 201, "new invitation before cancellation");
    const cancelToken = extractEmailToken(emailCount, "/recrutador/convite");
    const pendingToCancel = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, tokenHash: true }
    });
    assert.ok(pendingToCancel && pendingToCancel.tokenHash === digest(cancelToken), "cancellable invitation token must match the stored digest");
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
    await expectStatus(refuseInvite, 201, "new invitation before refusal");
    const refusalToken = extractEmailToken(emailCount, "/recrutador/convite");
    const refusal = await postJson("/api/recruiter/invitations/respond", { token: refusalToken, action: "refuse" });
    await expectStatus(refusal, 200, "recruiter refuses invitation");
    const refusedInvitation = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id },
      orderBy: { createdAt: "desc" },
      select: { status: true }
    });
    assert.equal(refusedInvitation?.status, "REFUSED");

    // Re-link the recruiter to company A, then prove company B cannot terminate that link.
    emailCount = SMTP_MESSAGES.length;
    const relinkInvite = await postJson("/api/company/recruiter-invitations", {
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(relinkInvite, 201, "new invitation before relinking");
    const relinkToken = extractEmailToken(emailCount, "/recrutador/convite");
    const relinkAccept = await postJson("/api/recruiter/invitations/respond", {
      token: relinkToken,
      action: "accept"
    }, { cookie: recruiterCookie });
    await expectStatus(relinkAccept, 200, "active recruiter accepts new company invitation");
    const activeLinkForIsolation = await prisma.recruiterLink.findFirst({
      where: { companyId: companyAccount.company.id, recruiterId: recruiterAccount.id, active: true },
      select: { id: true }
    });
    assert.ok(activeLinkForIsolation, "relinking must create a new active company link");

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
      email: RECRUITER_EMAIL,
      fullName: "Recrutador de Teste E2E"
    }, { cookie: companyCookie });
    await expectStatus(crossCompanyCancelInvite, 201, "company A creates invitation for cross-company cancellation test");
    const crossCompanyCancelToken = extractEmailToken(emailCount, "/recrutador/convite");
    const crossCompanyPending = await prisma.recruiterInvitation.findFirst({
      where: { companyId: companyAccount.company.id, recipientUserId: recruiterAccount.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, tokenHash: true }
    });
    assert.ok(crossCompanyPending && crossCompanyPending.tokenHash === digest(crossCompanyCancelToken), "cross-company cancellation test invitation must be pending for company A");
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

    process.stdout.write("Auth E2E passed: candidate auth/recovery and session revocation; company verification; recruiter invitation/resend/accept/refuse/cancel; multi-company isolation and concurrency; logout; account lockout.\n");
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
