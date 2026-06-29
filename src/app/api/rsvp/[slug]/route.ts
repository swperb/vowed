import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { weddings, guests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { sendRsvpConfirmation } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.websiteSlug, (await params).slug),
  });

  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    partnerAName: wedding.partnerAName,
    partnerBName: wedding.partnerBName,
    weddingDate: wedding.weddingDate,
    venue: wedding.venue,
    city: wedding.city,
  });
}

const rsvpSchema = z.object({
  guestId: z.string().min(1).max(64),
  rsvpStatus: z.enum(["pending", "attending", "declined", "maybe"]),
  mealChoice: z.string().max(120).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Rate limit public submissions by IP (no-op until Upstash is configured)
  if (!(await rateLimit(`rsvp:${clientIp(req)}`))) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.websiteSlug, (await params).slug),
  });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = rsvpSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  const { guestId, rsvpStatus, mealChoice } = parsed.data;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    rsvpStatus,
    rsvpRespondedAt: now,
    updatedAt: now,
  };
  if (mealChoice !== undefined) updates.mealChoice = mealChoice;

  // Scope update to this wedding so a guest id from another wedding cannot be touched
  const [updated] = await db
    .update(guests)
    .set(updates)
    .where(and(eq(guests.id, guestId), eq(guests.weddingId, wedding.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

  if (updated.email && (rsvpStatus === "attending" || rsvpStatus === "declined")) {
    // Reply-To = the couple's account email, so a guest's reply reaches them
    let coupleEmail: string | undefined;
    try {
      const client = await clerkClient();
      const owner = await client.users.getUser(wedding.clerkUserId);
      coupleEmail =
        owner.emailAddresses.find((e) => e.id === owner.primaryEmailAddressId)?.emailAddress ??
        owner.emailAddresses[0]?.emailAddress;
    } catch (err) {
      console.error("Could not load couple email for Reply-To:", err);
    }

    await sendRsvpConfirmation({
      to: updated.email,
      guestName: updated.firstName,
      coupleName: `${wedding.partnerAName} & ${wedding.partnerBName}`,
      attending: rsvpStatus === "attending",
      replyTo: coupleEmail,
    });
  }

  return NextResponse.json({ success: true, guest: updated });
}
