import { Resend } from "resend";

// Transactional email via Resend (free tier). No-ops until RESEND_API_KEY
// is set, so RSVP still works without email configured.
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Vowed <noreply@vowed.love>";
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendRsvpConfirmation(opts: {
  to: string;
  guestName: string;
  coupleName: string;
  attending: boolean;
}): Promise<void> {
  if (!resend) return;
  const { to, guestName, coupleName, attending } = opts;
  const subject = attending
    ? `Your RSVP to ${coupleName} is confirmed`
    : `Your RSVP to ${coupleName}`;
  const text = attending
    ? `Hi ${guestName},\n\nThanks for confirming. We have you down as attending ${coupleName}'s wedding, and we'll be in touch with the details closer to the day.\n\nWith love,\n${coupleName}`
    : `Hi ${guestName},\n\nThanks for letting us know you can't make it to ${coupleName}'s wedding. You'll be missed.\n\nWith love,\n${coupleName}`;
  try {
    await resend.emails.send({ from, to, subject, text });
  } catch (err) {
    console.error("RSVP confirmation email failed:", err);
  }
}

// Notify the project admin of a vendor/planner inquiry. No-ops until both
// RESEND_API_KEY and ADMIN_EMAIL are set.
export async function sendAdminNotification(subject: string, text: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resend || !adminEmail) return false;
  try {
    await resend.emails.send({ from, to: adminEmail, subject, text });
    return true;
  } catch (err) {
    console.error("Admin notification email failed:", err);
    return false;
  }
}
