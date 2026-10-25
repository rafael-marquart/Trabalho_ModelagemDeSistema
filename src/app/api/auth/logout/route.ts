import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { revokeCurrentSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  await revokeCurrentSession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
