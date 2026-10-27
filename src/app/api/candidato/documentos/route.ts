import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

export const runtime = "nodejs";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);
const storageDirectory = () => process.env.CANDIDATE_UPLOAD_DIR || path.join(process.cwd(), ".private-uploads", "candidate-profile");

function detectedMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-") return "application/pdf";
  if (bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v,i) => bytes[i] === v)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const zipDirectoryText = new TextDecoder("windows-1252").decode(bytes);
    if (zipDirectoryText.includes("[Content_Types].xml") && zipDirectoryText.includes("word/")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return "application/zip";
  }
  if (bytes.length >= 8 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) return "application/msword";
  return null;
}

function categoryFrom(value: FormDataEntryValue | null): "COURSE" | "CERTIFICATION" | null {
  return value === "COURSE" || value === "CERTIFICATION" ? value : null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ documents: [] });
  const documents = await prisma.candidateProfileDocument.findMany({
    where: { candidateProfileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, category: true, displayName: true, originalName: true, mimeType: true, sizeBytes: true, createdAt: true }
  });
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ message: "Envie um formulário de arquivo válido." }, { status: 400 });
  const category = categoryFrom(form.get("category"));
  const displayName = form.get("displayName");
  const file = form.get("file");
  if (!category || typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 160 || !(file instanceof File)) {
    return NextResponse.json({ message: "Informe categoria, nome e arquivo válido." }, { status: 400 });
  }
  if (file.size < 1 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ message: "O arquivo deve ter até 10 MB." }, { status: 400 });
  }
  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    return NextResponse.json({ message: "Formato não permitido. Use PDF, DOC, DOCX, JPG ou PNG." }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = detectedMime(bytes);
  const extensionMatches =
    (extension === ".pdf" && mime === "application/pdf") ||
    ([".jpg", ".jpeg"].includes(extension) && mime === "image/jpeg") ||
    (extension === ".png" && mime === "image/png") ||
    (extension === ".doc" && mime === "application/msword") ||
    (extension === ".docx" && mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  if (!extensionMatches) return NextResponse.json({ message: "O conteúdo do arquivo não corresponde ao formato informado." }, { status: 400 });

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: user.id }, create: { userId: user.id }, update: {}, select: { id: true }
  });
  const storedName = randomUUID();
  const directory = storageDirectory();
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(path.join(directory, storedName), bytes, { flag: "wx", mode: 0o600 });
    const document = await prisma.candidateProfileDocument.create({
      data: {
        candidateProfileId: profile.id, category, displayName: displayName.trim(),
        originalName: path.basename(file.name).slice(0, 200), storedName,
        mimeType: extension === ".doc" ? "application/msword" : mime!, sizeBytes: bytes.byteLength
      },
      select: { id: true, category: true, displayName: true, originalName: true, mimeType: true, sizeBytes: true, createdAt: true }
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    const { unlink } = await import("node:fs/promises");
    await unlink(path.join(directory, storedName)).catch(() => undefined);
    throw error;
  }
}
