import Link from "next/link";
import {
  HeartHandshake, Users, PiggyBank, CheckSquare, Globe,
  Zap, Shield, Smartphone, ArrowRight, Star, Heart, Store, Briefcase
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
                title: "Free iOS app",
                desc: "Native app with Contacts sync, Calendar integration, and a native share sheet for your RSVP link. Free, like everything else.",
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

      {/* Pricing / how it's funded */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <h2 className="font-serif text-3xl font-semibold text-center text-stone-900 mb-4">
          Free for couples. Always.
        </h2>
        <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">
          No paywalls, no premium tier, no feature gates. Every planning tool is free forever, on
          web and iOS. Vowed is funded by vendors and wedding planners, never by the couples doing
          the planning.
        </p>

        {/* The free plan */}
        <div className="card p-8 mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <div className="text-2xl font-serif font-semibold text-stone-900">Everything, free</div>
            <div className="text-stone-500 text-sm">Web + iOS · Open source</div>
          </div>
          <p className="text-stone-500 text-sm mb-6">No credit card. No trial that expires. No upsell.</p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-stone-700 mb-8">
            {[
              "Unlimited guests & groups",
              "Full budget tracker",
              "Complete checklist",
              "Wedding website with RSVP",
              "CSV import & export",
              "Free native iOS app",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sage-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/sign-up" className="btn-primary justify-center">
            Start planning, free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* How it stays free */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-6">
            <Heart className="w-7 h-7 text-brand-500 mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">Support the project</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">
              Love Vowed? Leave an optional tip. Nothing is ever locked behind it.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
              <a
                href="https://github.com/sponsors/swperb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Sponsor on GitHub <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://ko-fi.com/swperb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Tip on Ko-fi <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <Link href="/for-vendors" className="card p-6 hover:border-brand-200 transition-colors group">
            <Store className="w-7 h-7 text-brand-500 mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">For vendors</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">
              Reach couples who are actively planning. Flat $39/month, cancel anytime, no lock-in.
            </p>
            <span className="text-sm font-medium text-brand-600 inline-flex items-center gap-1">
              List your business <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <Link href="/for-planners" className="card p-6 hover:border-brand-200 transition-colors group">
            <Briefcase className="w-7 h-7 text-brand-500 mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">For planners</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">
              Run Vowed for your clients under your own brand.
            </p>
            <span className="text-sm font-medium text-brand-600 inline-flex items-center gap-1">
              Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
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
