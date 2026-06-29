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
