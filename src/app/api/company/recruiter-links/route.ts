import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { accountUserId: user.id },
    select: { id: true }
  });
  if (!company || !user.isActive) {
    return NextResponse.json({ message: "A empresa não está habilitada para gerenciar recrutadores." }, { status: 403 });
  }

  const links = await prisma.recruiterLink.findMany({
    where: { companyId: company.id, active: true },
    select: {
      id: true,
      createdAt: true,
      recruiter: { select: { fullName: true, email: true, isActive: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ links });
}

