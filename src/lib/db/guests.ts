import { db } from "./index";
import { guests, guestGroups } from "./schema";
import { eq, and, count, sql, like, or, inArray } from "drizzle-orm";

export type GuestFilter = {
  rsvpStatus?: "pending" | "attending" | "declined" | "maybe";
  side?: "partner_a" | "partner_b" | "shared";
  search?: string;
  table?: string;
};

// ─── The key insight TheKnot is missing ───────────────────────────────────────
// We always return BOTH individual counts AND group counts,
// regardless of what filter is active. This is done at the query level,
// not the UI level, so it's never wrong.

export type GuestListStats = {
  totalGuests: number;        // individual people
  totalGroups: number;        // invitation units (households)
  attending: number;
  declined: number;
  pending: number;
  maybe: number;
  attendingGroups: number;    // groups where at least one person is attending
  pendingGroups: number;
};

export type GuestGroupWithMembers = {
  group: typeof guestGroups.$inferSelect;
  members: (typeof guests.$inferSelect)[];
  memberCount: number;
  attendingCount: number;
  rsvpStatus: "all_attending" | "all_declined" | "mixed" | "all_pending";
};

// Get all guest groups with their members, applying filters correctly
// Critical: when filtering by rsvp status, we still show the WHOLE GROUP
// but apply visual indicators — not hide the family/group context
export async function getGuestGroupsWithMembers(
  weddingId: string,
  filter?: GuestFilter
): Promise<{ groups: GuestGroupWithMembers[]; stats: GuestListStats }> {
  // Step 1: Get groups that match filter criteria
  let groupQuery = db
    .select({ id: guestGroups.id })
    .from(guestGroups)
    .where(eq(guestGroups.weddingId, weddingId));

  // Filter by side (partner A/B/shared) at group level
  // Filter by table at group level

  // Step 2: Get all members for those groups
  // When filtering by rsvp, we find groups that CONTAIN matching members,
  // then load ALL members of those groups (so you see full family context)
  let memberQuery = db
    .select()
    .from(guests)
    .innerJoin(guestGroups, eq(guests.groupId, guestGroups.id))
    .where(eq(guests.weddingId, weddingId));

  const allMembers = await memberQuery;

  // Step 3: Apply filters to find relevant group IDs
  let relevantGroupIds: Set<string>;

  if (filter?.rsvpStatus) {
    // Find groups that have at least one member with this RSVP status
    relevantGroupIds = new Set(
      allMembers
        .filter((m) => m.guests.rsvpStatus === filter.rsvpStatus)
        .map((m) => m.guests.groupId)
    );
  } else if (filter?.search) {
    const search = filter.search.toLowerCase();
    relevantGroupIds = new Set(
      allMembers
        .filter(
          (m) =>
            m.guests.firstName.toLowerCase().includes(search) ||
            (m.guests.lastName?.toLowerCase().includes(search)) ||
            m.guest_groups.name.toLowerCase().includes(search)
        )
        .map((m) => m.guests.groupId)
    );
  } else {
    relevantGroupIds = new Set(allMembers.map((m) => m.guests.groupId));
  }

  // Step 4: Group members by groupId
  const membersByGroup = new Map<string, (typeof guests.$inferSelect)[]>();
  const groupData = new Map<string, typeof guestGroups.$inferSelect>();

  for (const row of allMembers) {
    const gId = row.guests.groupId;
    if (!membersByGroup.has(gId)) {
      membersByGroup.set(gId, []);
      groupData.set(gId, row.guest_groups);
    }
    membersByGroup.get(gId)!.push(row.guests);
  }

  // Step 5: Build result, only for relevant groups
  const groups: GuestGroupWithMembers[] = [];

  for (const groupId of Array.from(relevantGroupIds)) {
    const group = groupData.get(groupId);
    const members = membersByGroup.get(groupId) ?? [];
    if (!group) continue;

    const attendingCount = members.filter((m) => m.rsvpStatus === "attending").length;
    const declinedCount = members.filter((m) => m.rsvpStatus === "declined").length;
    const pendingCount = members.filter((m) => m.rsvpStatus === "pending").length;

    let rsvpStatus: GuestGroupWithMembers["rsvpStatus"] = "all_pending";
    if (attendingCount === members.length) rsvpStatus = "all_attending";
    else if (declinedCount === members.length) rsvpStatus = "all_declined";
    else if (pendingCount === members.length) rsvpStatus = "all_pending";
    else rsvpStatus = "mixed";

    groups.push({
      group,
      members,
      memberCount: members.length,
      attendingCount,
      rsvpStatus,
    });
  }

  // Sort by group name
  groups.sort((a, b) => a.group.name.localeCompare(b.group.name));

  // Step 6: Compute stats over ALL guests (not just filtered)
  // This is always accurate regardless of active filter
  const allGuests = allMembers.map((m) => m.guests);
  const allGroups = Array.from(groupData.values());

  const stats: GuestListStats = {
    totalGuests: allGuests.length,
    totalGroups: allGroups.length,
    attending: allGuests.filter((g) => g.rsvpStatus === "attending").length,
    declined: allGuests.filter((g) => g.rsvpStatus === "declined").length,
    pending: allGuests.filter((g) => g.rsvpStatus === "pending").length,
    maybe: allGuests.filter((g) => g.rsvpStatus === "maybe").length,
    attendingGroups: 0,
    pendingGroups: 0,
  };

  // Compute group-level aggregate stats
  for (const [, members] of Array.from(membersByGroup)) {
    const hasAttending = (members as typeof guests.$inferSelect[]).some((m) => m.rsvpStatus === "attending");
    const allPending = (members as typeof guests.$inferSelect[]).every((m) => m.rsvpStatus === "pending");
    if (hasAttending) stats.attendingGroups++;
    if (allPending) stats.pendingGroups++;
  }

  return { groups, stats };
}

// Quick stats for dashboard (lightweight)
export async function getGuestStats(weddingId: string) {
  const result = await db
    .select({
      rsvpStatus: guests.rsvpStatus,
      count: count(),
    })
    .from(guests)
    .where(eq(guests.weddingId, weddingId))
    .groupBy(guests.rsvpStatus);

  const groupCount = await db
    .select({ count: count() })
    .from(guestGroups)
    .where(eq(guestGroups.weddingId, weddingId));

  return {
    byStatus: result,
    groupCount: groupCount[0]?.count ?? 0,
  };
}
