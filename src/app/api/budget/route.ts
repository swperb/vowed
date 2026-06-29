import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, budgetCategories } from "@/lib/db/schema";
import { getBudgetSummary } from "@/lib/db/budget";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ totalBudget: 0, totalEstimated: 0, totalActual: 0, totalPaid: 0, remaining: 0, categories: [] });

  const summary = await getBudgetSummary(wedding.id);
  return NextResponse.json(summary);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, budgetedAmount, color, icon } = body as {
    name: string;
    budgetedAmount?: number;
    color?: string;
    icon?: string;
  };

  const [category] = await db
    .insert(budgetCategories)
    .values({
      id: generateId(),
      weddingId: wedding.id,
      name,
      budgetedAmount: budgetedAmount ?? 0,
      color: color ?? "#8b5cf6",
      icon: icon ?? null,
    })
    .returning();

  return NextResponse.json(category, { status: 201 });
}
