import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

export const runtime = "nodejs";
const storageDirectory = () => process.env.CANDIDATE_UPLOAD_DIR || path.join(process.cwd(), ".private-uploads", "candidate-profile");

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const document = await prisma.candidateProfileDocument.findFirst({
    where: { id, candidateProfile: { userId: user.id } }
  });
  if (!document) return NextResponse.json({ message: "Arquivo não encontrado." }, { status: 404 });
  try {
    const bytes = await readFile(path.join(storageDirectory(), document.storedName));
    const safeName = document.originalName.replace(/[\r\n"\\]/g, "_");
    const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");
    const encodedName = encodeURIComponent(safeName);
    return new Response(bytes, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(document.sizeBytes),
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ message: "O arquivo não está disponível no armazenamento local." }, { status: 404 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const document = await prisma.candidateProfileDocument.findFirst({
    where: { id, candidateProfile: { userId: user.id } }
  });
  if (!document) return NextResponse.json({ message: "Arquivo não encontrado." }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    await tx.candidateProfileDocument.delete({ where: { id: document.id } });
    await tx.auditEvent.create({
      data: {
        actorUserId: user.id, eventType: "CANDIDATE_PROFILE_DOCUMENT_REMOVED",
        subjectType: "CandidateProfileDocument", subjectId: document.id,
        metadata: { category: document.category }
      }
    });
  });
  await unlink(path.join(storageDirectory(), document.storedName)).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
