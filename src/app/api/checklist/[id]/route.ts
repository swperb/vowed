import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, checklistItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseBody } from "@/lib/validation";
import { z } from "zod";

const putSchema = z.object({
  isCompleted: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  dueDate: z.string().max(40).nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, putSchema);
  if (error) return error;

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (data.isCompleted !== undefined) {
    updates.isCompleted = data.isCompleted;
    updates.completedAt = data.isCompleted ? new Date().toISOString() : null;
  }
  if (data.title !== undefined) updates.title = data.title;
  if (data.dueDate !== undefined) updates.dueDate = data.dueDate;

  const [updated] = await db
    .update(checklistItems)
    .set(updates)
    .where(and(eq(checklistItems.id, (await params).id), eq(checklistItems.weddingId, wedding.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(checklistItems).where(
    and(eq(checklistItems.id, (await params).id), eq(checklistItems.weddingId, wedding.id))
  );

  return NextResponse.json({ success: true });
}
