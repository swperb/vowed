"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createWedding } from "./actions";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";

function slugify(a: string, b: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return a && b ? `${clean(a)}-${clean(b)}` : "";
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [partnerAName, setPartnerAName] = useState("");
  const [partnerBName, setPartnerBName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!slugEdited) {
      setSlug(slugify(partnerAName, partnerBName));
    }
    setStep(2);
  }

  function handlePartnerChange(a: string, b: string) {
    if (!slugEdited) {
      setSlug(slugify(a, b));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("partnerAName", partnerAName);
    fd.set("partnerBName", partnerBName);
    fd.set("weddingDate", weddingDate);
    fd.set("venue", venue);
    fd.set("city", city);
    fd.set("websiteSlug", slug);
    startTransition(async () => {
      const result = await createWedding(fd);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-brand-600 mb-2">
            <Heart className="w-6 h-6 fill-brand-500 text-brand-500" />
            <span className="font-serif text-2xl font-semibold text-stone-900">Vowed</span>
          </div>
          <p className="text-stone-500 text-sm">Let's get your wedding set up.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-brand-500" : "bg-stone-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-brand-500" : "bg-stone-200"}`} />
        </div>

        <div className="card p-8">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-1">The couple</h2>
                <p className="text-stone-500 text-sm">Tell us who's getting married.</p>
              </div>

              <div>
                <label className="label" htmlFor="partnerA">Partner A's name</label>
                <input
                  id="partnerA"
                  className="input"
                  type="text"
                  placeholder="e.g. Sarah"
                  value={partnerAName}
                  onChange={(e) => {
                    setPartnerAName(e.target.value);
                    handlePartnerChange(e.target.value, partnerBName);
                  }}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="partnerB">Partner B's name</label>
                <input
                  id="partnerB"
                  className="input"
                  type="text"
                  placeholder="e.g. James"
                  value={partnerBName}
                  onChange={(e) => {
                    setPartnerBName(e.target.value);
                    handlePartnerChange(partnerAName, e.target.value);
                  }}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="weddingDate">Wedding date</label>
                <input
                  id="weddingDate"
                  className="input"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-1">The details</h2>
                <p className="text-stone-500 text-sm">Optional, you can fill this in later.</p>
              </div>

              <div>
                <label className="label" htmlFor="venue">Venue name</label>
                <input
                  id="venue"
                  className="input"
                  type="text"
                  placeholder="e.g. The Grand Ballroom"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="city">City</label>
                <input
                  id="city"
                  className="input"
                  type="text"
                  placeholder="e.g. Nashville, TN"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="slug">
                  Website slug
                  <span className="text-stone-400 font-normal ml-1">(editable)</span>
                </label>
                <input
                  id="slug"
                  className="input"
                  type="text"
                  placeholder="sarah-james"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    setSlugEdited(true);
                  }}
                />
                {slug && (
                  <p className="text-xs text-stone-400 mt-1.5">
                    Your RSVP page: <span className="text-stone-600">vowed.love/rsvp/{slug}-<span className="text-stone-400">xxxx</span></span>
                    <br />
                    A short code is added to the end to keep your link unique.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex-[2]"
                >
                  {isPending ? "Setting up..." : "Go to dashboard"}
                  {!isPending && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
