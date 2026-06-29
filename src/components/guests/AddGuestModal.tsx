"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Member = {
  firstName: string;
  lastName: string;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerAName?: string;
  partnerBName?: string;
  onSuccess: () => void;
};

const emptyMember = (): Member => ({ firstName: "", lastName: "", email: "" });

export function AddGuestModal({ open, onOpenChange, partnerAName, partnerBName, onSuccess }: Props) {
  const [groupName, setGroupName] = useState("");
  const [side, setSide] = useState<"partner_a" | "partner_b" | "shared">("shared");
  const [notes, setNotes] = useState("");
  const [members, setMembers] = useState<Member[]>([emptyMember()]);
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState({ line1: "", city: "", state: "", zip: "" });
  const [submitting, setSubmitting] = useState(false);

  function addMember() {
    setMembers((m) => [...m, emptyMember()]);
  }

  function removeMember(i: number) {
    setMembers((m) => m.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof Member, value: string) {
    setMembers((m) => m.map((mem, idx) => (idx === i ? { ...mem, [field]: value } : mem)));
  }

  function reset() {
    setGroupName("");
    setSide("shared");
    setNotes("");
    setMembers([emptyMember()]);
    setShowAddress(false);
    setAddress({ line1: "", city: "", state: "", zip: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validMembers = members.filter((m) => m.firstName.trim());
    if (!groupName.trim() || validMembers.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: {
            name: groupName.trim(),
            side,
            notes: notes || undefined,
            addressLine1: address.line1 || undefined,
            city: address.city || undefined,
            state: address.state || undefined,
            zip: address.zip || undefined,
          },
          members: validMembers.map((m) => ({
            firstName: m.firstName.trim(),
            lastName: m.lastName.trim() || undefined,
            email: m.email.trim() || undefined,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to add guests");

      toast.success(`Added ${validMembers.length} ${validMembers.length === 1 ? "guest" : "guests"} to ${groupName}`);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to add guests. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const sideLabel = (s: typeof side) => {
    if (s === "partner_a") return partnerAName ? `${partnerAName}'s side` : "Partner A's side";
    if (s === "partner_b") return partnerBName ? `${partnerBName}'s side` : "Partner B's side";
    return "Shared / Both sides";
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 focus:outline-none">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="font-serif text-xl font-semibold text-stone-900">
              Add guests
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Group name */}
            <div>
              <label className="label" htmlFor="groupName">Group name</label>
              <input
                id="groupName"
                className="input"
                type="text"
                placeholder="e.g. The Johnson Family"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
              <p className="text-xs text-stone-400 mt-1">This is the name on the invitation envelope.</p>
            </div>

            {/* Side */}
            <div>
              <label className="label">Side</label>
              <div className="flex gap-2">
                {(["partner_a", "partner_b", "shared"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm rounded-lg border transition-colors",
                      side === s
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    )}
                  >
                    {sideLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* Members */}
            <div>
              <label className="label">People in this group</label>
              <div className="space-y-3">
                {members.map((member, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        type="text"
                        placeholder="First name"
                        value={member.firstName}
                        onChange={(e) => updateMember(i, "firstName", e.target.value)}
                        required={i === 0}
                      />
                      <input
                        className="input"
                        type="text"
                        placeholder="Last name"
                        value={member.lastName}
                        onChange={(e) => updateMember(i, "lastName", e.target.value)}
                      />
                      <input
                        className="input col-span-2"
                        type="email"
                        placeholder="Email (optional)"
                        value={member.email}
                        onChange={(e) => updateMember(i, "email", e.target.value)}
                      />
                    </div>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(i)}
                        className="mt-2 p-1.5 text-stone-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMember}
                className="mt-2 btn-ghost text-sm text-stone-500"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another person
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="label" htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                className="input resize-none"
                rows={2}
                placeholder="Dietary needs, accessibility, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Address (collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAddress(!showAddress)}
                className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAddress && "rotate-180")} />
                {showAddress ? "Hide mailing address" : "Add mailing address"}
              </button>

              {showAddress && (
                <div className="mt-3 space-y-2">
                  <input
                    className="input"
                    type="text"
                    placeholder="Street address"
                    value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className="input col-span-1"
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    />
                    <input
                      className="input"
                      type="text"
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                    />
                    <input
                      className="input"
                      type="text"
                      placeholder="ZIP"
                      value={address.zip}
                      onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="btn-ghost flex-1">Cancel</button>
              </Dialog.Close>
              <button type="submit" disabled={submitting} className="btn-primary flex-[2]">
                {submitting ? "Adding..." : `Add ${members.filter((m) => m.firstName.trim()).length || ""} guest${members.filter((m) => m.firstName.trim()).length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
