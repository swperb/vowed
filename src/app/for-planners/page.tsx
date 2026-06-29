"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartHandshake, Check, Briefcase, Users, Palette, Share2 } from "lucide-react";
import { toast } from "sonner";

const FEATURES = [
  { icon: Users, title: "Multiple weddings, one account", desc: "Manage every client's wedding from a single dashboard." },
  { icon: Share2, title: "Client sharing", desc: "Give each couple their own access while you keep oversight." },
  { icon: Palette, title: "Your brand", desc: "Your logo on their wedding website and RSVP page." },
];

export default function PlannersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      business: fd.get("business"),
      email: fd.get("email"),
      clientCount: fd.get("clientCount"),
      message: fd.get("message"),
    };
    try {
      const res = await fetch("/api/inquiries/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      toast.success("You're on the waitlist. We'll be in touch.");
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
          <Briefcase className="w-3 h-3" />
          For wedding planners
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 leading-tight mb-5">
          Run Vowed for your clients, under your own brand.
        </h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto">
          Give every couple you work with the same fast, reliable planning tools, with your logo on
          their wedding website. We're building this now. Join the waitlist to help shape it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <f.icon className="w-8 h-8 text-brand-500 mb-4" />
              <h3 className="font-semibold text-stone-900 mb-2">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-md mx-auto px-4 pb-20">
        <div className="card p-8">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-sage-600" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">You're on the waitlist</h2>
              <p className="text-stone-500 text-sm">We'll reach out as the planner tools come together.</p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-1">Join the waitlist</h2>
              <p className="text-stone-500 text-sm mb-6">Tell us about your practice and we'll keep you posted.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="name">Your name</label>
                  <input id="name" name="name" className="input" required maxLength={120} />
                </div>
                <div>
                  <label className="label" htmlFor="business">Business name</label>
                  <input id="business" name="business" className="input" placeholder="optional" maxLength={200} />
                </div>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" className="input" required maxLength={200} />
                </div>
                <div>
                  <label className="label" htmlFor="clientCount">How many clients per year?</label>
                  <input id="clientCount" name="clientCount" className="input" placeholder="optional" maxLength={40} />
                </div>
                <div>
                  <label className="label" htmlFor="message">Anything you'd want it to do?</label>
                  <textarea id="message" name="message" className="input min-h-[80px]" placeholder="optional" maxLength={2000} />
                </div>
                <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
                  {pending ? "Submitting..." : "Join waitlist"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
