"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartHandshake, Check, Store } from "lucide-react";
import { toast } from "sonner";

const DIFFERENTIATORS = [
  { theKnot: "12-month lock-in contract", vowed: "Month-to-month, cancel any time" },
  { theKnot: "$300-400 / month", vowed: "$39 / month, flat" },
  { theKnot: "Buried in a pay-to-win algorithm", vowed: "Clearly labeled as featured" },
  { theKnot: "Sales rep pressure tactics", vowed: "Self-serve signup, no calls" },
];

const FAQ = [
  { q: "How much does it cost?", a: "A flat $39 per month. No setup fees, no tiers, no annual contract. Cancel any time." },
  { q: "What do I get?", a: "A featured listing shown to couples planning a wedding in your region and category, clearly labeled as featured." },
  { q: "Are these real leads?", a: "Couples reach out directly. We never sell fake or recycled leads, and we don't take a cut of your bookings." },
  { q: "Can I cancel?", a: "Any time, from your dashboard. No phone call, no retention script, no penalty." },
];

export default function VendorsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      businessName: fd.get("businessName"),
      category: fd.get("category"),
      email: fd.get("email"),
      website: fd.get("website"),
      region: fd.get("region"),
    };
    try {
      const res = await fetch("/api/inquiries/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      toast.success("Thanks. We'll be in touch shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-100 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-900">
          <HeartHandshake className="w-5 h-5 text-brand-600" />
          <span className="font-serif text-lg font-semibold">Vowed</span>
        </Link>
      </nav>

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-medium text-brand-700 mb-6">
          <Store className="w-3 h-3" />
          For wedding vendors
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 leading-tight mb-5">
          Reach couples who are actually planning, not browsing.
        </h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto">
          $39/month flat. No lock-in. Cancel any time. Clearly labeled as featured. Self-serve.
          Everything TheKnot makes painful, made simple.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-2 text-sm">
            <div className="bg-stone-50 px-5 py-3 font-medium text-stone-400 border-b border-stone-100">TheKnot</div>
            <div className="bg-brand-50/40 px-5 py-3 font-medium text-brand-700 border-b border-brand-100">Vowed</div>
            {DIFFERENTIATORS.map((d, i) => (
              <div key={i} className="contents">
                <div className="px-5 py-3 text-stone-400 line-through border-b border-stone-50">{d.theKnot}</div>
                <div className="px-5 py-3 text-stone-700 border-b border-stone-50 flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage-500 shrink-0" />
                  {d.vowed}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-md mx-auto px-4 pb-16">
        <div className="card p-8">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-sage-600" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">You're on the list</h2>
              <p className="text-stone-500 text-sm">We'll reach out to get your listing set up.</p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-1">List your business</h2>
              <p className="text-stone-500 text-sm mb-6">Tell us a bit about you and we'll get you set up.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="businessName">Business name</label>
                  <input id="businessName" name="businessName" className="input" required maxLength={200} />
                </div>
                <div>
                  <label className="label" htmlFor="category">Category</label>
                  <input id="category" name="category" className="input" placeholder="e.g. Photographer, Florist, Venue" required maxLength={80} />
                </div>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" className="input" required maxLength={200} />
                </div>
                <div>
                  <label className="label" htmlFor="website">Website</label>
                  <input id="website" name="website" className="input" placeholder="optional" maxLength={200} />
                </div>
                <div>
                  <label className="label" htmlFor="region">Region you serve</label>
                  <input id="region" name="region" className="input" placeholder="optional, e.g. Nashville, TN" maxLength={120} />
                </div>
                <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
                  {pending ? "Submitting..." : "Request a listing"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-20">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 text-center mb-8">Common questions</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="card p-5">
              <h3 className="font-medium text-stone-900 mb-1">{item.q}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
