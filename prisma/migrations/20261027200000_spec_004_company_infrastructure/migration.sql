CREATE TABLE "CompanyInfrastructure" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "answers" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyInfrastructure_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyInfrastructure_companyId_key" ON "CompanyInfrastructure"("companyId");

ALTER TABLE "CompanyInfrastructure"
  ADD CONSTRAINT "CompanyInfrastructure_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
