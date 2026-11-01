-- Saved travel estimates: a trip (addresses + means of transport + peak-hour policy) is sent to HERE only once.
CREATE TABLE "TravelTimeCache" (
    "key" TEXT NOT NULL,
    "minutes" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TravelTimeCache_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "TravelTimeCache_computedAt_idx" ON "TravelTimeCache"("computedAt");
