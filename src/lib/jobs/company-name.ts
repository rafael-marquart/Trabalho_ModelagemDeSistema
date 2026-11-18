type CompanyNames = { tradeName: string | null; legalName: string } | null | undefined;

/**
 * Name shown for the company of a job. Own jobs use the company account (trade name, else legal name); external jobs
 * (SPEC-006) have no account and use the hiring company named by the source or by a validated extraction.
 */
export function jobCompanyName(company: CompanyNames, externalCompanyName?: string | null): string {
  if (company) return company.tradeName || company.legalName;
  return externalCompanyName?.trim() || "Empresa não informada";
}

/** Company of an own job. Own jobs always have one (database check "Job_own_has_company"); external jobs never reach here. */
export function ownCompanyId(job: { id: string; companyId: string | null }): string {
  if (!job.companyId) throw new Error(`Job ${job.id} has no company account.`);
  return job.companyId;
}
