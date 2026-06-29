"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  HeartHandshake,
  LayoutDashboard,
  Users,
  PiggyBank,
  Store,
  CheckSquare,
  Globe,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/website", label: "Wedding website", icon: Globe },
  { href: "/timeline", label: "Timeline", icon: Calendar },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-stone-100 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-stone-100">
          <HeartHandshake className="w-5 h-5 text-brand-600" />
          <span className="font-serif text-lg font-semibold text-stone-900">Vowed</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-item",
                  active && "nav-item-active"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-stone-100 space-y-1">
          <Link href="/settings" className="nav-item">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton />
            <span className="text-sm text-stone-600">Account</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
