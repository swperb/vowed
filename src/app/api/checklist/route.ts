import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, checklistItems } from "@/lib/db/schema";
import { DEFAULT_CHECKLIST } from "@/lib/db/checklist-defaults";
import { eq, count } from "drizzle-orm";
import { generateId, computeDueDate } from "@/lib/utils";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json([]);

  const existing = await db
    .select({ count: count() })
    .from(checklistItems)
    .where(eq(checklistItems.weddingId, wedding.id));

  if (existing[0].count === 0 && wedding.weddingDate) {
    // Seed from defaults
    const seeded = DEFAULT_CHECKLIST.map((item) => ({
      id: generateId(),
      weddingId: wedding.id,
      title: item.title,
      description: item.description ?? null,
      category: item.category,
      dueOffsetDays: item.dueOffsetDays,
      dueDate: wedding.weddingDate ? computeDueDate(wedding.weddingDate, item.dueOffsetDays) : null,
      sortOrder: item.sortOrder,
      isCompleted: false,
      isCustom: false,
    }));

    await db.insert(checklistItems).values(seeded);
    return NextResponse.json(seeded);
  }

  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.weddingId, wedding.id))
    .orderBy(checklistItems.sortOrder);

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, category, dueDate } = body as { title: string; category?: string; dueDate?: string };

  const [item] = await db
    .insert(checklistItems)
    .values({
      id: generateId(),
      weddingId: wedding.id,
      title,
      category: category ?? null,
      dueDate: dueDate ?? null,
      isCustom: true,
      sortOrder: 9999,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
