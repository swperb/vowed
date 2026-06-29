import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, guests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseBody, rsvpStatusEnum } from "@/lib/validation";
import { z } from "zod";

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

const putSchema = z.object({
  rsvpStatus: rsvpStatusEnum.optional(),
  mealChoice: z.string().max(120).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, putSchema);
  if (error) return error;

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (data.rsvpStatus !== undefined) {
    updates.rsvpStatus = data.rsvpStatus;
    updates.rsvpRespondedAt = new Date().toISOString();
  }
  if (data.mealChoice !== undefined) updates.mealChoice = data.mealChoice;

  const [updated] = await db
    .update(guests)
    .set(updates)
    .where(and(eq(guests.id, params.id), eq(guests.weddingId, wedding.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
