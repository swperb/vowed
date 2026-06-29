import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, vendors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseBody, vendorStatusEnum } from "@/lib/validation";
import { z } from "zod";

const putSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().max(80).nullable().optional(),
  status: vendorStatusEnum.optional(),
  website: z.string().max(200).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  priceEstimate: z.number().nonnegative().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, putSchema);
  if (error) return error;

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) updates[key] = value;
  }

  const { id } = await params;
  const [updated] = await db
    .update(vendors)
    .set(updates)
    .where(and(eq(vendors.id, id), eq(vendors.weddingId, wedding.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await params;
  await db.delete(vendors).where(and(eq(vendors.id, id), eq(vendors.weddingId, wedding.id)));

  return NextResponse.json({ success: true });
}
