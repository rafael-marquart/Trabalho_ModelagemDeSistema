import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  }
  const options = await prisma.accessibilityNeedOption.findMany({
    orderBy: [{ group: "asc" }, { code: "asc" }],
    select: { code: true, name: true, description: true, group: true, isMandatory: true, isActive: true }
  });
  return NextResponse.json({ options });
}
