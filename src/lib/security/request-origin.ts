import { NextResponse } from "next/server";

/**
 * Reject browser requests that explicitly identify a different origin.
 * Set APP_BASE_URL to the public application origin in production; when it is
 * absent, the request URL origin is used as a development fallback.
 * Requests without an Origin header remain supported for non-browser clients.
 */
export function rejectCrossOriginRequest(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  let receivedOrigin: string;
  let expectedOrigin: string;
  try {
    receivedOrigin = new URL(origin).origin;
    expectedOrigin = new URL(process.env.APP_BASE_URL || request.url).origin;
  } catch {
    return NextResponse.json({ message: "Origem da requisição inválida." }, { status: 403 });
  }

  if (receivedOrigin !== expectedOrigin) {
    return NextResponse.json({ message: "Requisição de outra origem não permitida." }, { status: 403 });
  }
  return null;
}
