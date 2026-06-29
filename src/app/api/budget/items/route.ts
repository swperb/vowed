import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetItems, budgetCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { parseBody } from "@/lib/validation";
import { z } from "zod";

const itemSchema = z.object({
  categoryId: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  estimatedAmount: z.number().nonnegative().optional(),
  actualAmount: z.number().nonnegative().nullable().optional(),
  vendorName: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  dueDate: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, itemSchema);
  if (error) return error;

  // Verify the category belongs to this wedding before attaching an item to it
  const category = await db.query.budgetCategories.findFirst({
    where: and(eq(budgetCategories.id, data.categoryId), eq(budgetCategories.weddingId, wedding.id)),
  });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const [item] = await db
    .insert(budgetItems)
    .values({
      id: generateId(),
      weddingId: wedding.id,
      categoryId: data.categoryId,
      name: data.name,
      estimatedAmount: data.estimatedAmount ?? 0,
      actualAmount: data.actualAmount ?? null,
      vendorName: data.vendorName ?? null,
      notes: data.notes ?? null,
      dueDate: data.dueDate ?? null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
