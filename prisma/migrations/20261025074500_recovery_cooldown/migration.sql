-- Persist the required 15-minute recovery cooldown after an account/IP quota is reached.
CREATE TABLE "RecoveryBlock" (
    "scopeKey" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecoveryBlock_pkey" PRIMARY KEY ("scopeKey")
);
CREATE INDEX "RecoveryBlock_blockedUntil_idx" ON "RecoveryBlock"("blockedUntil");
