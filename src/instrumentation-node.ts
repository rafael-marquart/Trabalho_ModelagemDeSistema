import { kickNotificationDelivery } from "@/lib/notifications/service";

// SPEC-017: a periodic round sends due notifications and retries the ones that failed temporarily (OPEN-068).
// Set NOTIFICATIONS_WORKER="off" to disable it (for example, when an external scheduler runs the deliveries instead).
// On Vercel there is no long-running server: retries come from /api/cron/notificacoes (see docs/operacao/deploy-vercel.md).
if (process.env.NOTIFICATIONS_WORKER !== "off" && !process.env.VERCEL) {
  const everyMs = Math.max(Number(process.env.NOTIFICATIONS_INTERVAL_MS) || 60_000, 5_000);
  const timer = setInterval(kickNotificationDelivery, everyMs);
  timer.unref?.();
  kickNotificationDelivery();
}
