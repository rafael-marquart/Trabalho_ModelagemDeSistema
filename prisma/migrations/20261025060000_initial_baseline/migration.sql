-- Initial schema baseline from prisma/schema.prisma.
-- PostgreSQL partial unique index enforces at most one active company link per recruiter.
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'COMPANY', 'RECRUITER', 'ADMIN');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'REFUSED', 'EXPIRED', 'CANCELLED', 'ACCEPTED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "officialId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "emailConfirmedAt" TIMESTAMP(3),
    "accountUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RecruiterLink" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "RecruiterLink_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RecruiterInvitation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "sentByUserId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecruiterInvitation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rememberMe" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "absoluteExpiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "subjectType" TEXT,
    "subjectId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RecoveryAttempt" (
    "id" TEXT NOT NULL,
    "identifierKey" TEXT NOT NULL,
    "ipKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecoveryAttempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifierKey" TEXT NOT NULL,
    "ipKey" TEXT NOT NULL,
    "succeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CompanyEmailVerificationToken" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyEmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");
CREATE UNIQUE INDEX "Company_officialId_key" ON "Company"("officialId");
CREATE UNIQUE INDEX "Company_accountUserId_key" ON "Company"("accountUserId");
CREATE INDEX "RecruiterLink_companyId_active_idx" ON "RecruiterLink"("companyId", "active");
CREATE INDEX "RecruiterLink_recruiterId_active_idx" ON "RecruiterLink"("recruiterId", "active");
CREATE UNIQUE INDEX "RecruiterLink_one_active_per_recruiter_key" ON "RecruiterLink"("recruiterId") WHERE "active" = true;
CREATE UNIQUE INDEX "RecruiterInvitation_tokenHash_key" ON "RecruiterInvitation"("tokenHash");
CREATE INDEX "RecruiterInvitation_companyId_status_idx" ON "RecruiterInvitation"("companyId", "status");
CREATE INDEX "RecruiterInvitation_recipientUserId_status_idx" ON "RecruiterInvitation"("recipientUserId", "status");
CREATE INDEX "RecruiterInvitation_expiresAt_status_idx" ON "RecruiterInvitation"("expiresAt", "status");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "AuditEvent"("actorUserId", "createdAt");
CREATE INDEX "AuditEvent_eventType_createdAt_idx" ON "AuditEvent"("eventType", "createdAt");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "PasswordResetToken"("userId", "createdAt");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
CREATE INDEX "RecoveryAttempt_identifierKey_createdAt_idx" ON "RecoveryAttempt"("identifierKey", "createdAt");
CREATE INDEX "RecoveryAttempt_ipKey_createdAt_idx" ON "RecoveryAttempt"("ipKey", "createdAt");
CREATE INDEX "LoginAttempt_identifierKey_createdAt_idx" ON "LoginAttempt"("identifierKey", "createdAt");
CREATE INDEX "LoginAttempt_ipKey_createdAt_idx" ON "LoginAttempt"("ipKey", "createdAt");
CREATE UNIQUE INDEX "CompanyEmailVerificationToken_tokenHash_key" ON "CompanyEmailVerificationToken"("tokenHash");
CREATE INDEX "CompanyEmailVerificationToken_companyId_createdAt_idx" ON "CompanyEmailVerificationToken"("companyId", "createdAt");
CREATE INDEX "CompanyEmailVerificationToken_expiresAt_idx" ON "CompanyEmailVerificationToken"("expiresAt");

ALTER TABLE "Company" ADD CONSTRAINT "Company_accountUserId_fkey" FOREIGN KEY ("accountUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruiterLink" ADD CONSTRAINT "RecruiterLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruiterLink" ADD CONSTRAINT "RecruiterLink_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruiterInvitation" ADD CONSTRAINT "RecruiterInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruiterInvitation" ADD CONSTRAINT "RecruiterInvitation_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruiterInvitation" ADD CONSTRAINT "RecruiterInvitation_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyEmailVerificationToken" ADD CONSTRAINT "CompanyEmailVerificationToken_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
