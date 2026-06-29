"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type WeddingInfo = {
  partnerAName: string;
  partnerBName: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
};

type GuestMatch = {
  id: string;
  firstName: string;
  lastName: string | null;
  rsvpStatus: string | null;
  mealChoice: string | null;
  groupName: string;
};

type RsvpFormState = {
  rsvpStatus: "attending" | "declined";
  mealChoice: string;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function RsvpPage({ params }: { params: { slug: string } }) {
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<GuestMatch | null>(null);
  const [form, setForm] = useState<RsvpFormState>({ rsvpStatus: "attending", mealChoice: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/rsvp/${params.slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setWedding(data); });
  }, [params.slug]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/rsvp/${params.slug}/guests?q=${encodeURIComponent(q)}`);
    if (res.ok) setResults(await res.json());
    setSearching(false);
  }, [params.slug]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);

    const res = await fetch(`/api/rsvp/${params.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestId: selected.id,
        rsvpStatus: form.rsvpStatus,
        mealChoice: form.mealChoice || undefined,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Heart className="w-10 h-10 text-stone-200 mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-stone-600 mb-2">Wedding not found</h1>
          <p className="text-stone-400">This RSVP page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  if (submitted && selected) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-stone-900 mb-2">
            {form.rsvpStatus === "attending" ? "You're coming!" : "We'll miss you."}
          </h2>
          <p className="text-stone-500 mb-2">
            {form.rsvpStatus === "attending"
              ? `We can't wait to celebrate with you, ${selected.firstName}!`
              : `Thank you for letting us know, ${selected.firstName}.`}
          </p>
          {form.rsvpStatus === "attending" && wedding.weddingDate && (
            <p className="text-stone-400 text-sm">{formatDate(wedding.weddingDate)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-brand-400 fill-brand-300" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 mb-3">
            {wedding.partnerAName} &amp; {wedding.partnerBName}
          </h1>
          {wedding.weddingDate && (
            <p className="text-stone-500 text-lg mb-1">{formatDate(wedding.weddingDate)}</p>
          )}
          {(wedding.venue || wedding.city) && (
            <p className="text-stone-400">
              {[wedding.venue, wedding.city].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* RSVP form */}
      <div className="max-w-lg mx-auto px-4 py-12">
        {!selected ? (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2 text-center">
              RSVP
            </h2>
            <p className="text-stone-500 text-center text-sm mb-6">
              Enter your name to find your invitation.
            </p>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                className="input pl-9 text-base"
                type="text"
                placeholder="Your name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {searching && (
              <p className="text-center text-stone-400 text-sm">Searching...</p>
            )}

            {results.length > 0 && (
              <div className="card divide-y divide-stone-50 overflow-hidden">
                {results.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => {
                      setSelected(guest);
                      setForm({ rsvpStatus: "attending", mealChoice: guest.mealChoice ?? "" });
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-stone-800">
                        {guest.firstName} {guest.lastName ?? ""}
                      </div>
                      <div className="text-xs text-stone-400">{guest.groupName}</div>
                    </div>
                    {guest.rsvpStatus && guest.rsvpStatus !== "pending" && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        guest.rsvpStatus === "attending" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
                      )}>
                        {guest.rsvpStatus === "attending" ? "Attending" : "Declined"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && !searching && results.length === 0 && (
              <p className="text-center text-stone-400 text-sm">
                No guests found. Double-check your name or contact the couple.
              </p>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-stone-400 hover:text-stone-600 mb-6 flex items-center gap-1"
            >
              Back to search
            </button>

            <div className="card p-6 mb-6 text-center">
              <p className="text-stone-500 text-sm mb-1">RSVP for</p>
              <h3 className="font-serif text-2xl font-semibold text-stone-900">
                {selected.firstName} {selected.lastName ?? ""}
              </h3>
              <p className="text-stone-400 text-sm">{selected.groupName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Attending / declined */}
              <div>
                <label className="label text-center block mb-3">Will you be attending?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rsvpStatus: "attending" }))}
                    className={cn(
                      "flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all font-medium text-sm",
                      form.rsvpStatus === "attending"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    )}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Joyfully accepts
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rsvpStatus: "declined" }))}
                    className={cn(
                      "flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all font-medium text-sm",
                      form.rsvpStatus === "declined"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    )}
                  >
                    <XCircle className="w-5 h-5" />
                    Regretfully declines
                  </button>
                </div>
              </div>

              {/* Meal choice */}
              {form.rsvpStatus === "attending" && (
                <div>
                  <label className="label" htmlFor="meal">Meal preference (optional)</label>
                  <select
                    id="meal"
                    className="input"
                    value={form.mealChoice}
                    onChange={(e) => setForm((f) => ({ ...f, mealChoice: e.target.value }))}
                  >
                    <option value="">No preference / not selected</option>
                    <option value="chicken">Chicken</option>
                    <option value="fish">Fish</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center text-base py-3"
              >
                {submitting ? "Submitting..." : "Submit RSVP"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
