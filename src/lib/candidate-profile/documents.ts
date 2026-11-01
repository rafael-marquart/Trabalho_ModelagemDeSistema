/**
 * Largest proof of course or certification a candidate can attach (SPEC-002). 4 MB because serverless hosting (Vercel)
 * refuses request bodies above 4.5 MB, form encoding included (OPEN-099, previously 10 MB).
 */
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
