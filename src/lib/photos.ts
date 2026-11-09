/**
 * Profile photos of candidates and recruiters (OPEN-101). The browser sends a 512 px square JPEG; the server accepts
 * JPEG, PNG or WebP up to 1 MB, recognised by their first bytes (the declared type is not trusted).
 */
export const MAX_PHOTO_BYTES = 1024 * 1024;
export const PHOTO_SIZE = 512;
export const PHOTO_ROLES = new Set(["CANDIDATE", "RECRUITER"]);

export function detectImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return "image/png";
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

/** The image itself, private to the people allowed to see it; revalidated on each view so a new photo shows at once. */
export function photoResponse(photo: { bytes: Uint8Array; mimeType: string }) {
  return new Response(Buffer.from(photo.bytes), {
    headers: {
      "Content-Type": photo.mimeType,
      "Content-Length": String(photo.bytes.byteLength),
      "Cache-Control": "private, no-cache",
      "Content-Disposition": "inline"
    }
  });
}

export const noPhoto = () => new Response(null, { status: 404, headers: { "Cache-Control": "private, no-cache" } });
