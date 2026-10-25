import { NextResponse } from "next/server";

/**
 * Reject browser requests that explicitly identify a different origin.
 * Production deployments must configure APP_BASE_URL to the public canonical
 * origin; failing closed avoids trusting a potentially host-derived request URL.
 * Requests without an Origin header remain supported for non-browser clients.
 */
export function rejectCrossOriginRequest(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const configuredBaseUrl = process.env.APP_BASE_URL;
  if (process.env.NODE_ENV === "production" && !configuredBaseUrl) {
    return NextResponse.json(
      { message: "A origem pública da aplicação não está configurada." },
      { status: 503 }
    );
  }

  let receivedOrigin: string;
  let expectedOrigin: string;
  try {
    receivedOrigin = new URL(origin).origin;
    expectedOrigin = new URL(configuredBaseUrl || request.url).origin;
  } catch {
    return NextResponse.json({ message: "Origem da requisição inválida." }, { status: 403 });
  }

  if (receivedOrigin !== expectedOrigin) {
    return NextResponse.json({ message: "Requisição de outra origem não permitida." }, { status: 403 });
  }
  return null;
}
