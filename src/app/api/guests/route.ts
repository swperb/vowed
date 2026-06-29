import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, guestGroups, guests } from "@/lib/db/schema";
import { getGuestGroupsWithMembers } from "@/lib/db/guests";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { parseBody, sideEnum, roleEnum } from "@/lib/validation";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rsvpStatus = searchParams.get("rsvp") as "pending" | "attending" | "declined" | "maybe" | null;
  const search = searchParams.get("search") ?? undefined;

  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.clerkUserId, userId),
  });

  if (!wedding) {
    return NextResponse.json({ groups: [], stats: { totalGuests: 0, totalGroups: 0, attending: 0, declined: 0, pending: 0, maybe: 0, attendingGroups: 0, pendingGroups: 0 } });
  }

  const result = await getGuestGroupsWithMembers(wedding.id, {
    rsvpStatus: rsvpStatus ?? undefined,
    search,
  });

  return NextResponse.json(result);
}

const createSchema = z.object({
  group: z.object({
    name: z.string().min(1).max(200),
    side: sideEnum.optional(),
    notes: z.string().max(2000).optional(),
    addressLine1: z.string().max(200).optional(),
    city: z.string().max(120).optional(),
    state: z.string().max(120).optional(),
    zip: z.string().max(20).optional(),
  }),
  members: z
    .array(
      z.object({
        firstName: z.string().min(1).max(120),
        lastName: z.string().max(120).optional(),
        email: z.string().max(200).optional(),
        phone: z.string().max(40).optional(),
        isChild: z.boolean().optional(),
        isPlusOne: z.boolean().optional(),
        role: roleEnum.optional(),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.clerkUserId, userId),
  });
  if (!wedding) return NextResponse.json({ error: "No wedding found" }, { status: 404 });

  const { data, error } = await parseBody(req, createSchema);
  if (error) return error;
  const { group: groupData, members: membersData } = data;

  const groupId = generateId();
  const [group] = await db
    .insert(guestGroups)
    .values({
      id: groupId,
      weddingId: wedding.id,
      name: groupData.name,
      side: groupData.side ?? "shared",
      notes: groupData.notes ?? null,
      addressLine1: groupData.addressLine1 ?? null,
      city: groupData.city ?? null,
      state: groupData.state ?? null,
      zip: groupData.zip ?? null,
    })
    .returning();

  const insertedMembers = await db
    .insert(guests)
    .values(
      membersData.map((m) => ({
        id: generateId(),
        groupId,
        weddingId: wedding.id,
        firstName: m.firstName,
        lastName: m.lastName ?? null,
        email: m.email || null,
        phone: m.phone ?? null,
        isChild: m.isChild ?? false,
        isPlusOne: m.isPlusOne ?? false,
        role: m.role ?? "guest",
      }))
    )
    .returning();

  return NextResponse.json({ group, members: insertedMembers }, { status: 201 });
}
