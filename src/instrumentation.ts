// Runs once when the Next.js server starts. SPEC-017: a periodic round sends due notifications and retries the ones that
// failed temporarily (OPEN-068). Set NOTIFICATIONS_WORKER="off" to disable it (for example, when an external scheduler
// runs the deliveries instead).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NOTIFICATIONS_WORKER === "off") return;
  const { kickNotificationDelivery } = await import("@/lib/notifications/service");
  const everyMs = Math.max(Number(process.env.NOTIFICATIONS_INTERVAL_MS) || 60_000, 5_000);
  const timer = setInterval(kickNotificationDelivery, everyMs);
  timer.unref?.();
  kickNotificationDelivery();
}
