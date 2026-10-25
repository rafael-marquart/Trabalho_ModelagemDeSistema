/**
 * Returns the canonical public origin for links sent by email.
 * Production must provide APP_BASE_URL; never derive security-sensitive links
 * from a request Host header in production.
 */
export function getPublicBaseUrl(request: Request): string | null {
  const configured = process.env.APP_BASE_URL?.trim();
  if (!configured && process.env.NODE_ENV === "production") return null;

  const candidate = configured || request.url;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}
