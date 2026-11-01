import { prisma } from "@/lib/prisma";

// Stages in which an application still takes part in the selection process.
export const ACTIVE_STAGES = ["INSCRITO", "TRIAGEM", "ENTREVISTA", "FINALISTA"] as const;
// Stages that still block a new application to the same job (RB-14); refused and cancelled ones do not.
export const BLOCKING_STAGES = [...ACTIVE_STAGES, "CONTRATADO"] as const;

/** OPEN-022: once a job has received any application, its conditions can no longer be edited. */
export async function jobHasApplications(jobId: string): Promise<boolean> {
  return (await prisma.application.count({ where: { jobId } })) > 0;
}

/** RB-42/OPEN-042: candidates whose application is still in progress when the job closes (to be notified by SPEC-017). */
export async function listActiveCandidatesForJob(jobId: string): Promise<string[]> {
  const rows = await prisma.application.findMany({ where: { jobId, stage: { in: [...ACTIVE_STAGES] } }, select: { candidateUserId: true } });
  return rows.map((row) => row.candidateUserId);
}
