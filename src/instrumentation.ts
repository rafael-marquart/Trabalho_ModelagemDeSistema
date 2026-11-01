// Runs once when the Next.js server starts. The Node-only part lives in instrumentation-node.ts and is imported inside
// this check, as the Next.js docs require: otherwise it is also bundled for the edge runtime, where nodemailer cannot load.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
