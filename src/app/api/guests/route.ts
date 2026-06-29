import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, guestGroups, guests } from "@/lib/db/schema";
import { getGuestGroupsWithMembers } from "@/lib/db/guests";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { userId } = auth();
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

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.clerkUserId, userId),
  });
  if (!wedding) return NextResponse.json({ error: "No wedding found" }, { status: 404 });

  const body = await req.json();
  const { group: groupData, members: membersData } = body as {
    group: {
      name: string;
      side?: string;
      notes?: string;
      addressLine1?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    members: Array<{
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
      isChild?: boolean;
      isPlusOne?: boolean;
      role?: string;
    }>;
  };

  const groupId = generateId();
  const [group] = await db
    .insert(guestGroups)
    .values({
      id: groupId,
      weddingId: wedding.id,
      name: groupData.name,
      side: (groupData.side as "partner_a" | "partner_b" | "shared") ?? "shared",
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
        email: m.email ?? null,
        phone: m.phone ?? null,
        isChild: m.isChild ?? false,
        isPlusOne: m.isPlusOne ?? false,
        role: (m.role as "guest" | "wedding_party" | "family" | "vendor" | "officiant") ?? "guest",
      }))
    )
    .returning();

  return NextResponse.json({ group, members: insertedMembers }, { status: 201 });
}
