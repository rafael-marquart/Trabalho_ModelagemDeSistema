import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const [link, invitations] = await Promise.all([
    prisma.recruiterLink.findFirst({
      where: { recruiterId: user.id, active: true },
      select: {
        id: true,
        createdAt: true,
        company: { select: { legalName: true, tradeName: true } }
      }
    }),
    prisma.recruiterInvitation.findMany({
      where: { recipientUserId: user.id, status: "PENDING", expiresAt: { gt: now } },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        company: { select: { legalName: true, tradeName: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return NextResponse.json({
    link: link ? {
      id: link.id,
      createdAt: link.createdAt,
      companyName: link.company.tradeName || link.company.legalName
    } : null,
    invitations: invitations.map(invitation => ({
      id: invitation.id,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      companyName: invitation.company.tradeName || invitation.company.legalName
    }))
  });
}
