-- CNPJ is optional during initial company registration.
ALTER TABLE "Company" ALTER COLUMN "officialId" DROP NOT NULL;
