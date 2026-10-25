import { NextRequest, NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await revokeCurrentSession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
