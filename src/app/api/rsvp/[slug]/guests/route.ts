import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddings, guests, guestGroups } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim();

  if (!q || q.length < 2) return NextResponse.json([]);

  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.websiteSlug, (await params).slug),
  });

  if (!wedding) return NextResponse.json([]);

  const allGuests = await db
    .select()
    .from(guests)
    .innerJoin(guestGroups, eq(guests.groupId, guestGroups.id))
    .where(eq(guests.weddingId, wedding.id));

  const matches = allGuests.filter((row) => {
    const full = `${row.guests.firstName} ${row.guests.lastName ?? ""}`.toLowerCase();
    return full.includes(q) || row.guest_groups.name.toLowerCase().includes(q);
  });

  return NextResponse.json(
    matches.map((row) => ({
      id: row.guests.id,
      firstName: row.guests.firstName,
      lastName: row.guests.lastName,
      rsvpStatus: row.guests.rsvpStatus,
      mealChoice: row.guests.mealChoice,
      groupName: row.guest_groups.name,
    }))
  );
}
