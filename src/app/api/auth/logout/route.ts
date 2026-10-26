import { NextRequest, NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  // Do not build a redirect from the request Host header in production.
  // APP_BASE_URL is required there; fail closed before revoking the session
  // if the canonical public origin is unavailable.
  const publicBaseUrl = getPublicBaseUrl(request);
  if (!publicBaseUrl) {
    return NextResponse.json(
      { message: "A origem pública da aplicação não está configurada." },
      { status: 503 }
    );
  }

  await revokeCurrentSession();
  return NextResponse.redirect(new URL("/", publicBaseUrl), { status: 303 });
}
