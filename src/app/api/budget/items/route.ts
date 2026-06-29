import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { categoryId, name, estimatedAmount, actualAmount, vendorName, notes, dueDate } = body as {
    categoryId: string;
    name: string;
    estimatedAmount?: number;
    actualAmount?: number;
    vendorName?: string;
    notes?: string;
    dueDate?: string;
  };

  const [item] = await db
    .insert(budgetItems)
    .values({
      id: generateId(),
      weddingId: wedding.id,
      categoryId,
      name,
      estimatedAmount: estimatedAmount ?? 0,
      actualAmount: actualAmount ?? null,
      vendorName: vendorName ?? null,
      notes: notes ?? null,
      dueDate: dueDate ?? null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
