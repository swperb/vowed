"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, Plus, Globe, Phone, Mail, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import type { Vendor } from "@/lib/db/schema";
import { VendorModal } from "@/components/vendors/VendorModal";

const STATUS_GROUPS = [
  { key: "favorite", label: "Favorites" },
  { key: "contacted", label: "Contacted" },
  { key: "booked", label: "Booked" },
  { key: "passed", label: "Passed" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  favorite: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  booked: "bg-sage-50 text-sage-700 border-sage-200",
  passed: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const fetchVendors = useCallback(async () => {
    const res = await fetch("/api/vendors");
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  async function changeStatus(v: Vendor, status: string) {
    const prev = vendors;
    setVendors((list) => list.map((x) => (x.id === v.id ? { ...x, status: status as Vendor["status"] } : x)));
    const res = await fetch(`/api/vendors/${v.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setVendors(prev);
      toast.error("Couldn't update status");
    }
  }

  async function remove(v: Vendor) {
    if (!confirm(`Remove ${v.name}?`)) return;
    const prev = vendors;
    setVendors((list) => list.filter((x) => x.id !== v.id));
    const res = await fetch(`/api/vendors/${v.id}`, { method: "DELETE" });
    if (!res.ok) {
      setVendors(prev);
      toast.error("Couldn't remove vendor");
    }
  }

  const bookedCount = vendors.filter((v) => v.status === "booked").length;
  const bookedTotal = vendors
    .filter((v) => v.status === "booked")
    .reduce((s, v) => s + (v.priceEstimate ?? 0), 0);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">Vendors</h1>
          <p className="text-stone-500 text-sm mt-1">
            {vendors.length} tracked · {bookedCount} booked · {formatCurrency(bookedTotal)} booked spend
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          Add vendor
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="card p-12 text-center">
          <Store className="w-12 h-12 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">
            No vendors yet. Add the venues, photographers, and others you're considering and track them
            from favorite to booked.
          </p>
          <button onClick={openAdd} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Add your first vendor
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {STATUS_GROUPS.map((group) => {
            const items = vendors.filter((v) => (v.status ?? "favorite") === group.key);
            if (items.length === 0) return null;
            return (
              <section key={group.key}>
                <h2 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  {group.label}
                  <span className="text-xs font-normal text-stone-400">{items.length}</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map((v) => (
                    <div key={v.id} className="card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-stone-900 truncate">{v.name}</div>
                          {v.category && <div className="text-xs text-stone-400">{v.category}</div>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => { setEditing(v); setModalOpen(true); }} className="p-1.5 text-stone-400 hover:text-stone-600" aria-label="Edit vendor">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(v)} className="p-1.5 text-stone-400 hover:text-red-500" aria-label="Remove vendor">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {(v.website || v.phone || v.email) && (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-2">
                          {v.website && (
                            <a href={v.website.startsWith("http") ? v.website : `https://${v.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-brand-600">
                              <Globe className="w-3.5 h-3.5" /> Website
                            </a>
                          )}
                          {v.phone && (
                            <a href={`tel:${v.phone}`} className="inline-flex items-center gap-1 hover:text-brand-600">
                              <Phone className="w-3.5 h-3.5" /> {v.phone}
                            </a>
                          )}
                          {v.email && (
                            <a href={`mailto:${v.email}`} className="inline-flex items-center gap-1 hover:text-brand-600">
                              <Mail className="w-3.5 h-3.5" /> Email
                            </a>
                          )}
                        </div>
                      )}

                      {v.notes && <p className="text-xs text-stone-500 mt-2 line-clamp-2">{v.notes}</p>}

                      <div className="flex items-center justify-between mt-3">
                        {v.priceEstimate != null ? (
                          <span className="text-sm font-medium text-stone-700">{formatCurrency(v.priceEstimate)}</span>
                        ) : (
                          <span />
                        )}
                        <select
                          value={v.status ?? "favorite"}
                          onChange={(e) => changeStatus(v, e.target.value)}
                          className={cn("text-xs font-medium rounded-full border px-2 py-1 cursor-pointer", STATUS_BADGE[v.status ?? "favorite"])}
                          aria-label="Vendor status"
                        >
                          {STATUS_GROUPS.map((g) => (
                            <option key={g.key} value={g.key}>{g.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <VendorModal open={modalOpen} onOpenChange={setModalOpen} onSaved={fetchVendors} vendor={editing} />
    </div>
  );
}
