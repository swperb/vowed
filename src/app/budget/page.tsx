"use client";

import { useState, useEffect, useOptimistic } from "react";
import { ChevronDown, Plus, Trash2, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { BudgetSummary, CategoryWithItems } from "@/lib/db/budget";
import type { BudgetItem } from "@/lib/db/schema";

function AddCategoryForm({ onAdd }: { onAdd: (name: string, amount: number) => Promise<void> }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim(), parseFloat(amount) || 0);
    setName("");
    setAmount("");
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        className="input flex-1"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="input w-32"
        placeholder="Budget ($)"
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

function AddItemForm({ categoryId, onAdd }: { categoryId: string; onAdd: (item: Partial<BudgetItem> & { categoryId: string }) => Promise<void> }) {
  const [name, setName] = useState("");
  const [estimated, setEstimated] = useState("");
  const [vendor, setVendor] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onAdd({ categoryId, name: name.trim(), estimatedAmount: parseFloat(estimated) || 0, vendorName: vendor || undefined });
    setName("");
    setEstimated("");
    setVendor("");
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-2 bg-stone-50 border-t border-stone-100">
      <input className="input flex-[2]" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="input w-28" placeholder="Est. ($)" type="number" min="0" value={estimated} onChange={(e) => setEstimated(e.target.value)} />
      <input className="input w-32" placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
      <button type="submit" disabled={saving} className="btn-primary text-sm">
        {saving ? "..." : <Plus className="w-4 h-4" />}
      </button>
    </form>
  );
}

function CategoryAccordion({
  catWithItems,
  onTogglePaid,
  onDeleteItem,
  onAddItem,
}: {
  catWithItems: CategoryWithItems;
  onTogglePaid: (item: BudgetItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onAddItem: (item: Partial<BudgetItem> & { categoryId: string }) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const { category: cat, items, totalEstimated, totalPaid } = catWithItems;

  const paidPct = cat.budgetedAmount ? (totalPaid / (cat.budgetedAmount ?? 1)) * 100 : 0;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: cat.color ?? "#8b5cf6" }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-900">{cat.name}</div>
          <div className="text-xs text-stone-400 mt-0.5">
            {formatCurrency(totalEstimated)} estimated of {formatCurrency(cat.budgetedAmount ?? 0)} budgeted
          </div>
        </div>
        <div className="text-right shrink-0 mr-3">
          <div className="text-sm font-semibold text-stone-700">{formatCurrency(totalPaid)} paid</div>
          <div className="text-xs text-stone-400">{Math.round(paidPct)}% of budget</div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          {items.length > 0 && (
            <div className="border-t border-stone-100">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-xs text-stone-400 px-4 py-2 border-b border-stone-50 font-medium">
                <span>Item</span>
                <span className="text-right pr-4 w-28">Estimated</span>
                <span className="text-right pr-4 w-24">Actual</span>
                <span className="text-right pr-4 w-24">Vendor</span>
                <span className="text-center w-16">Paid</span>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-0 px-4 py-2.5 border-b border-stone-50 last:border-0 text-sm hover:bg-stone-50/50 group",
                    item.isPaid && "opacity-60"
                  )}
                >
                  <span className={cn("text-stone-800", item.isPaid && "line-through")}>{item.name}</span>
                  <span className="text-stone-500 text-right pr-4 w-28">{formatCurrency(item.estimatedAmount)}</span>
                  <span className="text-stone-500 text-right pr-4 w-24">
                    {item.actualAmount != null ? formatCurrency(item.actualAmount) : <span className="text-stone-300">--</span>}
                  </span>
                  <span className="text-stone-400 text-right pr-4 w-24 truncate">{item.vendorName ?? <span className="text-stone-200">--</span>}</span>
                  <div className="flex items-center justify-center gap-1 w-16">
                    <button
                      onClick={() => onTogglePaid(item)}
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        item.isPaid
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-stone-300 hover:border-emerald-400"
                      )}
                    >
                      {item.isPaid && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-300 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddItem ? (
            <AddItemForm categoryId={cat.id} onAdd={async (item) => { await onAddItem(item); setShowAddItem(false); }} />
          ) : (
            <div className="px-4 py-2 border-t border-stone-50">
              <button onClick={() => setShowAddItem(true)} className="btn-ghost text-sm text-stone-400">
                <Plus className="w-3.5 h-3.5" />
                Add item
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BudgetPage() {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);

  async function fetchBudget() {
    const res = await fetch("/api/budget");
    if (res.ok) setSummary(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchBudget(); }, []);

  async function handleAddCategory(name: string, amount: number) {
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, budgetedAmount: amount }),
    });
    if (res.ok) {
      toast.success(`Category "${name}" added.`);
      setShowAddCategory(false);
      fetchBudget();
    } else {
      toast.error("Failed to add category.");
    }
  }

  async function handleAddItem(item: Partial<BudgetItem> & { categoryId: string }) {
    const res = await fetch("/api/budget/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) fetchBudget();
    else toast.error("Failed to add item.");
  }

  async function handleTogglePaid(item: BudgetItem) {
    const newPaid = !item.isPaid;
    // Optimistic update
    setSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map((c) => ({
          ...c,
          items: c.items.map((i) => i.id === item.id ? { ...i, isPaid: newPaid } : i),
        })),
      };
    });

    const res = await fetch(`/api/budget/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: newPaid }),
    });
    if (!res.ok) {
      toast.error("Failed to update item.");
      fetchBudget();
    } else {
      fetchBudget();
    }
  }

  async function handleDeleteItem(id: string) {
    const res = await fetch(`/api/budget/items/${id}`, { method: "DELETE" });
    if (res.ok) fetchBudget();
    else toast.error("Failed to delete item.");
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-stone-100 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse bg-stone-50" />)}
        </div>
      </div>
    );
  }

  const s = summary ?? { totalBudget: 0, totalEstimated: 0, totalActual: 0, totalPaid: 0, remaining: 0, categories: [] };
  const paidPct = s.totalBudget > 0 ? (s.totalPaid / s.totalBudget) * 100 : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">Budget</h1>
          <p className="text-stone-500 text-sm mt-1">{s.categories.length} categories</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowAddCategory(!showAddCategory)}>
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total budget", value: formatCurrency(s.totalBudget), color: "text-stone-900" },
          { label: "Total estimated", value: formatCurrency(s.totalEstimated), color: "text-amber-700" },
          { label: "Total paid", value: formatCurrency(s.totalPaid), color: "text-emerald-700" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={cn("text-2xl font-semibold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-stone-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-stone-600 font-medium">Paid so far</span>
          <span className="text-stone-500">{formatCurrency(s.totalPaid)} of {formatCurrency(s.totalBudget)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(paidPct, 100)}%` }} />
        </div>
        <div className="text-xs text-stone-400 mt-1.5">{Math.round(paidPct)}% paid · {formatCurrency(s.remaining)} remaining</div>
      </div>

      {/* Add category form */}
      {showAddCategory && (
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-medium text-stone-700 mb-2">New category</h3>
          <AddCategoryForm onAdd={handleAddCategory} />
        </div>
      )}

      {/* Categories */}
      {s.categories.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-stone-400 mb-4">No budget categories yet.</p>
          <button className="btn-primary text-sm" onClick={() => setShowAddCategory(true)}>
            <Plus className="w-4 h-4" />
            Add first category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {s.categories.map((cat) => (
            <CategoryAccordion
              key={cat.category.id}
              catWithItems={cat}
              onTogglePaid={handleTogglePaid}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
