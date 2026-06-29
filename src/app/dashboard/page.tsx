import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { weddings, checklistItems, budgetItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getGuestStats } from "@/lib/db/guests";
import { getBudgetSummary } from "@/lib/db/budget";
import { daysUntilWedding, formatCurrency, formatPercent } from "@/lib/utils";
import { Users, PiggyBank, CheckSquare, Calendar, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const wedding = await db.query.weddings.findFirst({
    where: eq(weddings.clerkUserId, userId),
  });

  if (!wedding) redirect("/onboarding");

  const [guestStats, budgetSummary, checklist] = await Promise.all([
    getGuestStats(wedding.id),
    getBudgetSummary(wedding.id),
    db.select().from(checklistItems).where(eq(checklistItems.weddingId, wedding.id)),
  ]);

  const days = daysUntilWedding(wedding.weddingDate);
  const totalGuests = guestStats.byStatus.reduce((s, r) => s + Number(r.count), 0);
  const attending = guestStats.byStatus.find((r) => r.rsvpStatus === "attending")?.count ?? 0;
  const pending = guestStats.byStatus.find((r) => r.rsvpStatus === "pending")?.count ?? 0;
  const checklistDone = checklist.filter((i) => i.isCompleted).length;
  const checklistTotal = checklist.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          {wedding.partnerAName} & {wedding.partnerBName}
        </h1>
        {days !== null && (
          <p className="text-stone-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {days > 0 ? `${days} days until your wedding` : days === 0 ? "Your wedding day is today! 🎉" : "Congratulations on your wedding!"}
          </p>
        )}
      </div>

      {/* At-a-glance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Guests",
            value: totalGuests,
            sub: `${guestStats.groupCount} invitations`,
            icon: Users,
            href: "/guests",
            color: "text-brand-600",
            bg: "bg-brand-50",
          },
          {
            label: "Attending",
            value: Number(attending),
            sub: `${pending} still pending`,
            icon: Heart,
            href: "/guests",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Budget remaining",
            value: formatCurrency(budgetSummary.remaining),
            sub: `of ${formatCurrency(budgetSummary.totalBudget)}`,
            icon: PiggyBank,
            href: "/budget",
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Tasks done",
            value: `${checklistDone}/${checklistTotal}`,
            sub: formatPercent(checklistDone, checklistTotal) + " complete",
            icon: CheckSquare,
            href: "/checklist",
            color: "text-sage-600",
            bg: "bg-sage-50",
          },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="card p-5 hover:border-stone-200 transition-all group">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-semibold text-stone-900 mb-0.5">{card.value}</div>
            <div className="text-xs text-stone-400">{card.label}</div>
            <div className="text-xs text-stone-400 mt-0.5">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: "/guests", label: "Manage guest list", desc: `${pending} awaiting RSVP` },
          { href: "/budget", label: "Track budget", desc: `${formatCurrency(budgetSummary.totalPaid)} paid so far` },
          { href: "/checklist", label: "View checklist", desc: `${checklistTotal - checklistDone} tasks remaining` },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="card p-4 hover:border-brand-200 transition-all group flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-800 text-sm">{link.label}</div>
              <div className="text-xs text-stone-400 mt-0.5">{link.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-brand-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
