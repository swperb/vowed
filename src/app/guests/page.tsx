"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Plus, Download, Upload,
  UserCheck, UserX, Clock, HelpCircle, ChevronDown,
  Home, Mail
} from "lucide-react";
import { cn, rsvpColor, rsvpLabel, guestDisplayName } from "@/lib/utils";
import type { GuestGroupWithMembers, GuestListStats } from "@/lib/db/guests";
import { AddGuestModal } from "@/components/guests/AddGuestModal";
import { CsvImportModal } from "@/components/guests/CsvImportModal";

type RsvpFilter = "all" | "attending" | "declined" | "pending" | "maybe";

// ─── The key component: Stats bar that ALWAYS shows both counts ───────────────
// This is what TheKnot gets wrong — they drop the group count when you filter.
function GuestStatsBar({
  stats,
  activeFilter,
  filteredGroupCount,
  filteredGuestCount,
}: {
  stats: GuestListStats;
  activeFilter: RsvpFilter;
  filteredGroupCount: number;
  filteredGuestCount: number;
}) {
  const isFiltered = activeFilter !== "all";

  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Always-visible totals */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-semibold text-stone-900">{stats.totalGuests}</div>
            <div className="text-xs text-stone-500">total guests</div>
          </div>
          <div className="w-px h-10 bg-stone-100" />
          <div>
            <div className="text-2xl font-semibold text-stone-900">{stats.totalGroups}</div>
            <div className="text-xs text-stone-500">invitations</div>
          </div>
        </div>

        {/* Filtered count — shown when a filter is active */}
        {isFiltered && (
          <>
            <div className="w-px h-10 bg-brand-200" />
            <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-2">
              <div className="text-sm font-medium text-brand-700">
                Showing {filteredGuestCount} guests · {filteredGroupCount} groups
              </div>
              <div className="text-xs text-brand-500">
                filtered by: {rsvpLabel(activeFilter)}
              </div>
            </div>
          </>
        )}

        {/* RSVP breakdown */}
        <div className="ml-auto flex items-center gap-3 flex-wrap">
          {[
            { key: "attending" as const, icon: UserCheck, label: "Attending", count: stats.attending, color: "text-emerald-600" },
            { key: "declined" as const, icon: UserX, label: "Declined", count: stats.declined, color: "text-red-500" },
            { key: "pending" as const, icon: Clock, label: "Pending", count: stats.pending, color: "text-amber-500" },
            { key: "maybe" as const, icon: HelpCircle, label: "Maybe", count: stats.maybe, color: "text-blue-500" },
          ].map(({ key, icon: Icon, label, count, color }) => (
            <div key={key} className="text-center min-w-[48px]">
              <div className={cn("text-lg font-semibold", color)}>{count}</div>
              <div className="text-xs text-stone-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Guest Group Card ─────────────────────────────────────────────────────────
function GuestGroupCard({ group: g, activeFilter }: { group: GuestGroupWithMembers; activeFilter: RsvpFilter }) {
  const [expanded, setExpanded] = useState(false);
  const highlighted = activeFilter !== "all";

  return (
    <div className={cn(
      "card overflow-hidden transition-all",
      g.rsvpStatus === "all_attending" && "border-l-2 border-l-emerald-400",
      g.rsvpStatus === "all_declined" && "border-l-2 border-l-red-300",
    )}>
      {/* Group header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
          <Home className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-900 truncate">{g.group.name}</div>
          <div className="text-xs text-stone-500">
            {g.memberCount} {g.memberCount === 1 ? "person" : "people"} ·{" "}
            {g.attendingCount > 0 && `${g.attendingCount} attending`}
            {g.attendingCount === 0 && rsvpLabel(g.members[0]?.rsvpStatus ?? "pending")}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Group RSVP badge */}
          <span className={cn(
            "stat-pill text-xs",
            g.rsvpStatus === "all_attending" && "bg-emerald-50 border-emerald-200 text-emerald-700",
            g.rsvpStatus === "all_declined" && "bg-red-50 border-red-200 text-red-700",
            g.rsvpStatus === "all_pending" && "bg-amber-50 border-amber-200 text-amber-700",
            g.rsvpStatus === "mixed" && "bg-blue-50 border-blue-200 text-blue-700",
          )}>
            {g.rsvpStatus === "all_attending" && "All attending"}
            {g.rsvpStatus === "all_declined" && "All declined"}
            {g.rsvpStatus === "all_pending" && "Awaiting RSVP"}
            {g.rsvpStatus === "mixed" && "Mixed"}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-stone-400 transition-transform",
            expanded && "rotate-180"
          )} />
        </div>
      </button>

      {/* Members (expanded) */}
      {expanded && (
        <div className="border-t border-stone-100 divide-y divide-stone-50">
          {g.members.map((member) => {
            const isHighlighted = highlighted && member.rsvpStatus === activeFilter;
            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors",
                  isHighlighted && "bg-brand-50/50",
                  highlighted && !isHighlighted && "opacity-50"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-xs font-medium text-stone-500">
                  {member.firstName[0]}{member.lastName?.[0] ?? ""}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-800">
                    {guestDisplayName(member.firstName, member.lastName)}
                    {member.isChild && <span className="ml-1 text-xs text-stone-400">(child)</span>}
                    {member.isPlusOne && <span className="ml-1 text-xs text-stone-400">(+1)</span>}
                  </div>
                  {member.email && (
                    <div className="text-xs text-stone-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {member.mealChoice && (
                    <span className="text-xs text-stone-400 bg-stone-50 border border-stone-100 rounded px-2 py-0.5">
                      {member.mealChoice}
                    </span>
                  )}
                  <span className={cn("stat-pill", rsvpColor(member.rsvpStatus ?? "pending"))}>
                    {rsvpLabel(member.rsvpStatus ?? "pending")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Guest List Page ─────────────────────────────────────────────────────
export default function GuestsPage() {
  const [activeFilter, setActiveFilter] = useState<RsvpFilter>("all");
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<GuestGroupWithMembers[]>([]);
  const [stats, setStats] = useState<GuestListStats>({
    totalGuests: 0, totalGroups: 0, attending: 0,
    declined: 0, pending: 0, maybe: 0,
    attendingGroups: 0, pendingGroups: 0,
  });
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const fetchGuests = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeFilter !== "all") params.set("rsvp", activeFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/guests?${params}`);
    if (res.ok) {
      const data = await res.json();
      setGroups(data.groups);
      setStats(data.stats);
    }
    setLoading(false);
  }, [activeFilter, search]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const filteredGroupCount = groups.length;
  const filteredGuestCount = groups.reduce((s, g) => s + g.memberCount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">Guest list</h1>
          <p className="text-stone-500 text-sm mt-1">
            {stats.totalGroups} invitations · {stats.totalGuests} guests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm" onClick={() => setCsvModalOpen(true)}>
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button className="btn-secondary text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary text-sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add guests
          </button>
        </div>
      </div>

      {/* Stats — always visible, always accurate */}
      <GuestStatsBar
        stats={stats}
        activeFilter={activeFilter}
        filteredGroupCount={filteredGroupCount}
        filteredGuestCount={filteredGuestCount}
      />

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search guests, families..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* RSVP filter chips — show global counts even when filtered */}
        <div className="flex items-center gap-1.5">
          {([
            { key: "all", label: `All (${stats.totalGuests})` },
            { key: "attending", label: `Attending (${stats.attending})` },
            { key: "pending", label: `Pending (${stats.pending})` },
            { key: "declined", label: `Declined (${stats.declined})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "filter-chip",
                activeFilter === key ? "filter-chip-active" : "filter-chip-inactive"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Guest groups */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card h-16 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">
            {activeFilter !== "all" || search
              ? "No guests match this filter."
              : "No guests yet. Add your first guest or import a CSV."}
          </p>
          {activeFilter !== "all" ? (
            <button onClick={() => setActiveFilter("all")} className="btn-ghost text-sm">
              Clear filter
            </button>
          ) : (
            <button className="btn-primary text-sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add first guests
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <GuestGroupCard key={g.group.id} group={g} activeFilter={activeFilter} />
          ))}
        </div>
      )}

      <AddGuestModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchGuests}
      />
      <CsvImportModal
        open={csvModalOpen}
        onOpenChange={setCsvModalOpen}
        onSuccess={fetchGuests}
      />
    </div>
  );
}
