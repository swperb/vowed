"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Vendor } from "@/lib/db/schema";

const CATEGORIES = [
  "Venue", "Photography", "Videography", "Catering", "Florist", "Music / DJ",
  "Cake", "Hair & Makeup", "Officiant", "Transportation", "Stationery",
  "Rentals", "Planner", "Other",
];

const STATUSES = [
  { value: "favorite", label: "Favorite" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "passed", label: "Passed" },
];

export function VendorModal({
  open,
  onOpenChange,
  onSaved,
  vendor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  vendor?: Vendor | null;
}) {
  const [pending, setPending] = useState(false);
  const editing = !!vendor;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const price = (fd.get("priceEstimate") as string).trim();
    const body: Record<string, unknown> = {
      name: fd.get("name"),
      category: (fd.get("category") as string) || undefined,
      status: fd.get("status"),
      website: (fd.get("website") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      priceEstimate: price ? Number(price) : undefined,
    };
    try {
      const res = await fetch(editing ? `/api/vendors/${vendor!.id}` : "/api/vendors", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Vendor updated" : "Vendor added");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-serif text-xl font-semibold text-stone-900">
              {editing ? "Edit vendor" : "Add vendor"}
            </Dialog.Title>
            <Dialog.Close className="text-stone-400 hover:text-stone-600" aria-label="Close">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="v-name">Name</label>
              <input id="v-name" name="name" className="input" required maxLength={200} defaultValue={vendor?.name ?? ""} placeholder="e.g. The Grand Ballroom" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="v-category">Category</label>
                <input id="v-category" name="category" list="vendor-categories" className="input" maxLength={80} defaultValue={vendor?.category ?? ""} placeholder="e.g. Photography" />
                <datalist id="vendor-categories">
                  {CATEGORIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="label" htmlFor="v-status">Status</label>
                <select id="v-status" name="status" className="input" defaultValue={vendor?.status ?? "favorite"}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="v-website">Website</label>
              <input id="v-website" name="website" className="input" maxLength={200} defaultValue={vendor?.website ?? ""} placeholder="optional" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="v-phone">Phone</label>
                <input id="v-phone" name="phone" className="input" maxLength={40} defaultValue={vendor?.phone ?? ""} placeholder="optional" />
              </div>
              <div>
                <label className="label" htmlFor="v-email">Email</label>
                <input id="v-email" name="email" type="email" className="input" maxLength={200} defaultValue={vendor?.email ?? ""} placeholder="optional" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="v-price">Price estimate</label>
              <input id="v-price" name="priceEstimate" type="number" min="0" step="1" className="input" defaultValue={vendor?.priceEstimate ?? ""} placeholder="optional" />
            </div>

            <div>
              <label className="label" htmlFor="v-notes">Notes</label>
              <textarea id="v-notes" name="notes" className="input min-h-[72px]" maxLength={2000} defaultValue={vendor?.notes ?? ""} placeholder="optional" />
            </div>

            <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
              {pending ? "Saving..." : editing ? "Save changes" : "Add vendor"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
