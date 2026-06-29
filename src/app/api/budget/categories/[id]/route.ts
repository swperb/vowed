import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, budgetedAmount } = body as { name?: string; budgetedAmount?: number };

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (budgetedAmount !== undefined) updates.budgetedAmount = budgetedAmount;

  const [updated] = await db
    .update(budgetCategories)
    .set(updates)
    .where(and(eq(budgetCategories.id, params.id), eq(budgetCategories.weddingId, wedding.id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(budgetCategories).where(
    and(eq(budgetCategories.id, params.id), eq(budgetCategories.weddingId, wedding.id))
  );

  return NextResponse.json({ success: true });
}
