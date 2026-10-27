import { prisma } from "@/lib/prisma";
import { infrastructureCategories, infrastructureItems, type InfrastructureCategoryCode } from "./items";
import { normalizeAnswers, type InfrastructureAnswers } from "./schema";

export type InfrastructureSummary = {
  companyId: string;
  updatedAt: string | null;
  items: { code: string; category: InfrastructureCategoryCode; label: string; status: string; note: string }[];
};

// Read contract for authorized consumers (e.g. SPEC-005/007/008). It returns declared data only: unanswered
// items stay NOT_INFORMED and are never turned into presence, absence or compatibility.
export async function getCompanyInfrastructure(companyId: string): Promise<InfrastructureSummary> {
  const record = await prisma.companyInfrastructure.findUnique({
    where: { companyId }, select: { answers: true, updatedAt: true }
  });
  const answers: InfrastructureAnswers = normalizeAnswers(record?.answers);
  return {
    companyId,
    updatedAt: record ? record.updatedAt.toISOString() : null,
    items: infrastructureItems.map((item) => ({
      code: item.code, category: item.category, label: item.label,
      status: answers[item.code].status, note: answers[item.code].note
    }))
  };
}

export const categoryLabel = (code: InfrastructureCategoryCode) =>
  infrastructureCategories.find((category) => category.code === code)?.label ?? code;
