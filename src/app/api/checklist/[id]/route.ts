import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, checklistItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (body.isCompleted !== undefined) {
    updates.isCompleted = body.isCompleted;
    updates.completedAt = body.isCompleted ? new Date().toISOString() : null;
  }
  if (body.title !== undefined) updates.title = body.title;
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate;

  const [updated] = await db
    .update(checklistItems)
    .set(updates)
    .where(and(eq(checklistItems.id, params.id), eq(checklistItems.weddingId, wedding.id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(checklistItems).where(
    and(eq(checklistItems.id, params.id), eq(checklistItems.weddingId, wedding.id))
  );

  return NextResponse.json({ success: true });
}
