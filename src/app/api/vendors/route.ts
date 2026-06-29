import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, vendors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { parseBody, vendorStatusEnum } from "@/lib/validation";
import { z } from "zod";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(vendors)
    .where(eq(vendors.weddingId, wedding.id))
    .orderBy(vendors.sortOrder);

  return NextResponse.json(rows);
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(80).optional(),
  status: vendorStatusEnum.optional(),
  website: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(200).optional(),
  priceEstimate: z.number().nonnegative().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({ where: eq(weddings.clerkUserId, userId) });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await parseBody(req, createSchema);
  if (error) return error;

  const [vendor] = await db
    .insert(vendors)
    .values({
      id: generateId(),
      weddingId: wedding.id,
      name: data.name,
      category: data.category || null,
      status: data.status ?? "favorite",
      website: data.website || null,
      phone: data.phone || null,
      email: data.email || null,
      priceEstimate: data.priceEstimate ?? null,
      notes: data.notes || null,
    })
    .returning();

  return NextResponse.json(vendor, { status: 201 });
}
