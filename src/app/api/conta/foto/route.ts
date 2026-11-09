import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { detectImageType, MAX_PHOTO_BYTES, noPhoto, photoResponse, PHOTO_ROLES } from "@/lib/photos";

export const runtime = "nodejs";

async function photoOwner() {
  const user = await getCurrentUser();
  return user && PHOTO_ROLES.has(user.role) ? user : null;
}

/** The signed-in candidate's or recruiter's own photo (used by the avatar and the profile page). */
export async function GET() {
  const user = await photoOwner();
  if (!user) return noPhoto();
  const photo = await prisma.userPhoto.findUnique({ where: { userId: user.id }, select: { bytes: true, mimeType: true } });
  return photo ? photoResponse(photo) : noPhoto();
}

/** Whether there is a photo, without sending it. */
export async function HEAD() {
  const user = await photoOwner();
  if (!user) return noPhoto();
  const photo = await prisma.userPhoto.findUnique({ where: { userId: user.id }, select: { userId: true } });
  return new Response(null, { status: photo ? 200 : 404, headers: { "Cache-Control": "private, no-cache" } });
}

/** Adds or replaces the photo (OPEN-101). */
export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await photoOwner();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File)) return NextResponse.json({ message: "Escolha uma imagem." }, { status: 400 });
  if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ message: "A foto deve ter até 1 MB." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectImageType(bytes);
  if (!mimeType) return NextResponse.json({ message: "Use uma imagem JPG, PNG ou WebP." }, { status: 400 });
  await prisma.$transaction(async (tx) => {
    await tx.userPhoto.upsert({ where: { userId: user.id }, create: { userId: user.id, bytes, mimeType }, update: { bytes, mimeType } });
    await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "PROFILE_PHOTO_UPDATED", subjectType: "User", subjectId: user.id } });
  });
  return NextResponse.json({ ok: true, message: "Foto atualizada." });
}

/** Removes the photo; the avatar goes back to the initials. */
export async function DELETE(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await photoOwner();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  await prisma.$transaction(async (tx) => {
    const removed = await tx.userPhoto.deleteMany({ where: { userId: user.id } });
    if (removed.count) await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "PROFILE_PHOTO_REMOVED", subjectType: "User", subjectId: user.id } });
  });
  return NextResponse.json({ ok: true, message: "Foto removida." });
}
