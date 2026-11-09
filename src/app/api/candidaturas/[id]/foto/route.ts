import { resolveJobActor } from "@/lib/jobs/access";
import { prisma } from "@/lib/prisma";
import { noPhoto, photoResponse } from "@/lib/photos";

type Context = { params: Promise<{ id: string }> };

/**
 * The candidate's photo, for the company (and its recruiters) of the job the candidate applied to (OPEN-101). Served
 * through the application, so access follows the same rule as the application data; anyone else gets 404.
 */
export async function GET(_request: Request, context: Context) {
  const actor = await resolveJobActor();
  if (actor.error) return noPhoto();
  const { id } = await context.params;
  const application = await prisma.application.findFirst({
    where: { id, job: { companyId: actor.companyId } },
    select: { candidate: { select: { photo: { select: { bytes: true, mimeType: true } } } } }
  });
  const photo = application?.candidate.photo;
  return photo ? photoResponse(photo) : noPhoto();
}
