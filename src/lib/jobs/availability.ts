import { prisma } from "@/lib/prisma";
import { availabilityOf, type Availability } from "./detail";
import { todayInBrazil } from "./schema";

export { availabilityOf, type Availability };

/**
 * SPEC-009: current availability read from the stored record at the moment of the operation (OPEN-040). Drafts and
 * unknown jobs return null. If the record cannot be read, availability is never presumed: the job is reported as
 * not confirmable and actions that depend on it stay blocked.
 */
export async function checkJobAvailability(jobId: string, now: Date = new Date()): Promise<Availability | null> {
  try {
    const job = await prisma.job.findFirst({
      where: { id: jobId, origin: "OWN", status: { in: ["OPEN", "PAUSED", "CLOSED"] } },
      select: { status: true, deadline: true }
    });
    if (!job) return null;
    return availabilityOf(job.status, job.deadline ? job.deadline.toISOString().slice(0, 10) : "", todayInBrazil(now));
  } catch {
    return { code: "UNAVAILABLE", label: "Não confirmada", message: "Não foi possível confirmar a disponibilidade desta vaga agora. Tente novamente em instantes." };
  }
}

/** Whether a new application may be started (RB-01); used by SPEC-011, which also checks eligibility. */
export const acceptsApplications = (availability: Availability | null) => availability?.code === "OPEN";
