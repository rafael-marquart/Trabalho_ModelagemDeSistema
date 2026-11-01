CREATE TABLE "LoginBlock" (
    "ipKey" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,
    "cooldownSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoginBlock_pkey" PRIMARY KEY ("ipKey")
);

CREATE INDEX "LoginBlock_blockedUntil_idx" ON "LoginBlock"("blockedUntil");
