import { NextResponse } from "next/server";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";

/**
 * Reject browser requests that explicitly identify a different origin.
 * Production deployments must use an HTTPS APP_BASE_URL as the canonical
 * public origin. Requests without Origin remain supported for non-browser
 * clients, but production mutations still fail closed for invalid config.
 */
export function rejectCrossOriginRequest(request: Request): NextResponse | null {
  const publicBaseUrl = getPublicBaseUrl(request);
  if (process.env.NODE_ENV === "production" && !publicBaseUrl) {
    return NextResponse.json(
      { message: "A origem pública da aplicação não está configurada corretamente." },
      { status: 503 }
    );
  }

  const origin = request.headers.get("origin");
  if (!origin) return null;

  let receivedOrigin: string;
  let expectedOrigin: string;
  try {
    receivedOrigin = new URL(origin).origin;
    expectedOrigin = new URL(publicBaseUrl || request.url).origin;
  } catch {
    return NextResponse.json({ message: "Origem da requisição inválida." }, { status: 403 });
  }

  if (receivedOrigin !== expectedOrigin) {
    return NextResponse.json({ message: "Requisição de outra origem não permitida." }, { status: 403 });
  }
  return null;
}
