// Notifications service (Resend) — stubbed
import { log } from '../../lib/logger';

export async function sendNotificationEmail(to: string, subject: string, html: string) {
  // Implement Resend API call here. This is a safe stub for local dev.
  log.info('sendNotificationEmail', { to, subject });
  return { ok: true };
}
