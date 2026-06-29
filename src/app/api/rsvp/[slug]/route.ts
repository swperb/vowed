import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, guests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.websiteSlug, params.slug),
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

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.websiteSlug, params.slug),
  });

  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { guestId, rsvpStatus, mealChoice } = body as {
    guestId: string;
    rsvpStatus: string;
    mealChoice?: string;
  };

  const updates: Record<string, unknown> = {
    rsvpStatus,
    rsvpRespondedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (mealChoice !== undefined) updates.mealChoice = mealChoice;

  const [updated] = await db
    .update(guests)
    .set(updates)
    .where(and(eq(guests.id, guestId), eq(guests.weddingId, wedding.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

  return NextResponse.json({ success: true, guest: updated });
}
