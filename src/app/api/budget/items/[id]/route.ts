import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  const fields = ["name", "estimatedAmount", "actualAmount", "isPaid", "vendorName", "notes", "dueDate"] as const;
  for (const field of fields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (body.isPaid === true && !body.paidAt) {
    updates.paidAt = new Date().toISOString();
  }
  if (body.isPaid === false) {
    updates.paidAt = null;
  }

  const [updated] = await db
    .update(budgetItems)
    .set(updates)
    .where(and(eq(budgetItems.id, params.id), eq(budgetItems.weddingId, wedding.id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(budgetItems).where(
    and(eq(budgetItems.id, params.id), eq(budgetItems.weddingId, wedding.id))
  );

  return NextResponse.json({ success: true });
}
