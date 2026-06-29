import Link from "next/link";
import {
  HeartHandshake, Users, PiggyBank, CheckSquare, Globe,
  Zap, Shield, Smartphone, ArrowRight, Star
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-brand-600" />
            <span className="font-serif text-xl font-semibold text-stone-900">Vowed</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/sign-up" className="btn-primary text-sm">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-medium text-brand-700 mb-8">
          <Star className="w-3 h-3" />
          Free forever · Open source · No vendor lock-in
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-stone-900 leading-tight mb-6">
          Wedding planning
          <br />
          <span className="text-brand-600">that actually works.</span>
        </h1>
        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          No phantom save errors. No 2-minute guest list loads. No group counts disappearing when you filter.
          Just fast, reliable tools that respect the time and energy planning a wedding actually takes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sign-up" className="btn-primary text-base px-6 py-3">
            Get started, it's free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#features" className="btn-secondary text-base px-6 py-3">
            See what's included
          </Link>
        </div>
      </section>

      {/* Social proof — real complaints we fix */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              quote: "Why does my guest count change when I filter by RSVP status?",
              fix: "Vowed always shows both individual and group counts, on every view.",
              label: "Fixed",
            },
            {
              quote: "I added 10 guests and they all disappeared when I came back.",
              fix: "Optimistic saves with local backup, so your data is safe even if the network drops.",
              label: "Fixed",
            },
            {
              quote: "The budget tool is now just an ad for their vendors.",
              fix: "Real budget tracking with line items, actuals, and paid tracking. Zero ads.",
              label: "Fixed",
            },
          ].map((item, i) => (
            <div key={i} className="card p-5">
              <p className="text-sm text-stone-500 italic mb-3">"{item.quote}"</p>
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded-full bg-sage-100 text-sage-700 border border-sage-200 text-xs font-medium px-2 py-0.5">
                  {item.label}
                </span>
                <p className="text-sm text-stone-700">{item.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white border-y border-stone-100 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-semibold text-center text-stone-900 mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-center text-stone-500 mb-14 max-w-xl mx-auto">
            Built by someone planning a wedding who got fed up. Every feature exists because a real couple needed it.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Guest list",
                desc: "Groups/families as first-class objects. Individual + group counts on every filtered view. CSV import. One-click RSVP tracking.",
              },
              {
                icon: PiggyBank,
                title: "Budget tracker",
                desc: "Real line items with estimated vs. actual amounts. Paid tracking. Per-category budgets. No ads, no vendor steering.",
              },
              {
                icon: CheckSquare,
                title: "Checklist",
                desc: "Date-relative tasks that update automatically. Customizable. Covers 12+ months → day-of → thank you notes.",
              },
              {
                icon: Globe,
                title: "Wedding website",
                desc: "Your RSVP link, guest info, and wedding details on a beautiful public page. AirDrop or iMessage it to guests.",
              },
              {
                icon: Zap,
                title: "Fast by design",
                desc: "Edge database. Optimistic UI. Local-first saves. Pages load in milliseconds, not minutes.",
              },
              {
                icon: Smartphone,
                title: "iOS-first premium",
                desc: "Native app with Contacts sync, Calendar integration, iMessage templates, and AirDrop guest cards. Upgrade when you're ready.",
              },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-stone-100 hover:border-brand-200 transition-colors group">
                <f.icon className="w-8 h-8 text-brand-500 mb-4 group-hover:text-brand-600 transition-colors" />
                <h3 className="font-semibold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <h2 className="font-serif text-3xl font-semibold text-center text-stone-900 mb-4">
          Honest pricing
        </h2>
        <p className="text-center text-stone-500 mb-12">
          No bait-and-switch. The free tier is genuinely free and open source.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-8">
            <div className="text-2xl font-serif font-semibold text-stone-900 mb-1">Free</div>
            <div className="text-stone-500 text-sm mb-6">Forever · Open source</div>
            <ul className="space-y-3 text-sm text-stone-700 mb-8">
              {[
                "Unlimited guests & groups",
                "Full budget tracker",
                "Complete checklist",
                "Wedding website with RSVP",
                "CSV import & export",
                "Web app on any device",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sage-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="btn-secondary w-full justify-center">
              Start free
            </Link>
          </div>
          <div className="card p-8 border-brand-200 bg-brand-50/30 relative">
            <div className="absolute -top-3 right-6 rounded-full bg-brand-600 text-white text-xs font-medium px-3 py-1">
              Most popular
            </div>
            <div className="text-2xl font-serif font-semibold text-stone-900 mb-1">
              $49 <span className="text-base font-sans font-normal text-stone-500">one-time</span>
            </div>
            <div className="text-stone-500 text-sm mb-6">Or $9/month · iOS native app</div>
            <ul className="space-y-3 text-sm text-stone-700 mb-8">
              {[
                "Everything in Free",
                "Native iOS app",
                "Apple Contacts import",
                "Apple Calendar sync",
                "iMessage & AirDrop share",
                "Drag-and-drop seating chart",
                "Printable PDFs (timeline, seating)",
                "Guest group messaging",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="btn-primary w-full justify-center">
              Get Premium
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <HeartHandshake className="w-4 h-4 text-brand-500" />
            Vowed, free and open source
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-400">
            <Link href="https://github.com/swperb/vowed" className="hover:text-stone-600 transition-colors">
              GitHub
            </Link>
            <Link href="/privacy" className="hover:text-stone-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-stone-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
