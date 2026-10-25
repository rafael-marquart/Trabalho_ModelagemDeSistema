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
const EMAIL = `spec001-e2e-${randomUUID()}@example.test`;
const OLD_PASSWORD = "InitialPassword123";
const NEW_PASSWORD = "ChangedPassword456";
const SMTP_MESSAGES = [];
const SMTP_SOCKETS = new Set();
let app;
let appSpawnError;
let appOutput = "";

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
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

async function postJson(path, payload) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": TEST_IP
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
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { id: true }
  });
  if (!user) return;

  const ipKey = digest(TEST_IP);
  const identifierKey = digest(EMAIL.toLowerCase());
  const recoveryKey = digest(`user:${user.id}`);

  await prisma.$transaction(async tx => {
    await tx.loginAttempt.deleteMany({ where: { identifierKey, ipKey } });
    await tx.recoveryAttempt.deleteMany({ where: { identifierKey: recoveryKey, ipKey } });
    await tx.recoveryBlock.deleteMany({
      where: { scopeKey: { in: [`identifier:${recoveryKey}`, `ip:${ipKey}`] } }
    });
    await tx.auditEvent.deleteMany({
      where: { OR: [{ actorUserId: user.id }, { subjectId: user.id }] }
    });
    await tx.user.delete({ where: { id: user.id } });
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

    const mail = SMTP_MESSAGES.slice(previousMessageCount).join("\n");
    const rawTokenMatch = mail.match(/token=([A-Za-z0-9_-]{20,})/);
    assert.ok(rawTokenMatch?.[1], "test SMTP message must contain the one-time recovery token");
    const rawToken = rawTokenMatch[1];

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

    process.stdout.write("Auth E2E passed: registration, login/session, SMTP recovery, one-time reset, session revocation and re-login.\n");
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
