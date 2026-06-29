import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseBody } from "@/lib/validation";
import { z } from "zod";

const putSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  budgetedAmount: z.number().nonnegative().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, putSchema);
  if (error) return error;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.budgetedAmount !== undefined) updates.budgetedAmount = data.budgetedAmount;

  const [updated] = await db
    .update(budgetCategories)
    .set(updates)
    .where(and(eq(budgetCategories.id, params.id), eq(budgetCategories.weddingId, wedding.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
