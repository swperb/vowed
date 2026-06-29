import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, guests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(guests).where(
    and(eq(guests.id, params.id), eq(guests.weddingId, wedding.id))
  );

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { rsvpStatus, mealChoice } = body as { rsvpStatus?: string; mealChoice?: string };

  const updates: Record<string, unknown> = {};
  if (rsvpStatus !== undefined) {
    updates.rsvpStatus = rsvpStatus;
    updates.rsvpRespondedAt = new Date().toISOString();
  }
  if (mealChoice !== undefined) updates.mealChoice = mealChoice;
  updates.updatedAt = new Date().toISOString();

  const [updated] = await db
    .update(guests)
    .set(updates)
    .where(and(eq(guests.id, params.id), eq(guests.weddingId, wedding.id)))
    .returning();

  return NextResponse.json(updated);
}
