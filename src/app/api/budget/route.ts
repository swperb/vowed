import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetCategories } from "@/lib/db/schema";
import { getBudgetSummary } from "@/lib/db/budget";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { parseBody } from "@/lib/validation";
import { z } from "zod";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ totalBudget: 0, totalEstimated: 0, totalActual: 0, totalPaid: 0, remaining: 0, categories: [] });

  const summary = await getBudgetSummary(wedding.id);
  return NextResponse.json(summary);
}

const categorySchema = z.object({
  name: z.string().min(1).max(120),
  budgetedAmount: z.number().nonnegative().optional(),
  color: z.string().max(32).optional(),
  icon: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, categorySchema);
  if (error) return error;

  const [category] = await db
    .insert(budgetCategories)
    .values({
      id: generateId(),
      weddingId: wedding.id,
      name: data.name,
      budgetedAmount: data.budgetedAmount ?? 0,
      color: data.color ?? "#8b5cf6",
      icon: data.icon ?? null,
    })
    .returning();

  return NextResponse.json(category, { status: 201 });
}
