"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckSquare, Plus, X } from "lucide-react";
import { cn, relativeDays, isOverdue } from "@/lib/utils";
import { toast } from "sonner";
import type { ChecklistItem } from "@/lib/db/schema";

type TimeBucket = {
  label: string;
  key: string;
  items: ChecklistItem[];
};

function getTimeBucket(item: ChecklistItem, weddingDate?: string): string {
  if (!item.dueDate) return "other";
  const days = Math.ceil((new Date(item.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days > 365) return "12plus";
  if (days > 180) return "6to12";
  if (days > 90) return "3to6";
  if (days > 30) return "1to3";
  if (days > 0) return "under1";
  if (days === 0) return "dayof";
  return "after";
}

const BUCKET_LABELS: Record<string, string> = {
  "12plus": "12+ months out",
  "6to12": "6-12 months out",
  "3to6": "3-6 months out",
  "1to3": "1-3 months out",
  "under1": "Less than 1 month",
  "dayof": "Day of",
  "after": "After the wedding",
  "other": "No due date",
};

const BUCKET_ORDER = ["12plus", "6to12", "3to6", "1to3", "under1", "dayof", "after", "other"];

const ALL_CATEGORIES = "All";

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchItems() {
    const res = await fetch("/api/checklist");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  const categories = [ALL_CATEGORIES, ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const filtered = activeCategory === ALL_CATEGORIES
    ? items
    : items.filter((i) => i.category === activeCategory);

  const buckets: TimeBucket[] = BUCKET_ORDER
    .map((key) => ({
      key,
      label: BUCKET_LABELS[key],
      items: filtered.filter((i) => getTimeBucket(i) === key),
    }))
    .filter((b) => b.items.length > 0);

  const done = items.filter((i) => i.isCompleted).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  async function toggleItem(item: ChecklistItem) {
    const newVal = !item.isCompleted;
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isCompleted: newVal } : i));

    const res = await fetch(`/api/checklist/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: newVal }),
    });
    if (!res.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isCompleted: item.isCompleted } : i));
      toast.error("Failed to update task.");
    }
  }

  async function addCustomTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), category: newCategory || undefined, dueDate: newDueDate || undefined }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      toast.success("Task added.");
      setNewTitle("");
      setNewCategory("");
      setNewDueDate("");
      setAddModalOpen(false);
    } else {
      toast.error("Failed to add task.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-stone-100 rounded animate-pulse" />
        {[1, 2, 3].map((i) => <div key={i} className="card h-16 animate-pulse bg-stone-50" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">Checklist</h1>
          <p className="text-stone-500 text-sm mt-1">{done}/{total} tasks complete</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add custom task
        </button>
      </div>

      {/* Progress */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-stone-700">{pct}% complete</span>
          <span className="text-stone-400">{total - done} remaining</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {(categories as string[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "filter-chip",
              activeCategory === cat ? "filter-chip-active" : "filter-chip-inactive"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Buckets */}
      {buckets.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckSquare className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400">No tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {buckets.map((bucket) => (
            <div key={bucket.key}>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                {bucket.label}
              </h3>
              <div className="card divide-y divide-stone-50 overflow-hidden">
                {bucket.items.map((item) => {
                  const overdue = !item.isCompleted && isOverdue(item.dueDate);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-stone-50/50 transition-colors group",
                        item.isCompleted && "opacity-50"
                      )}
                    >
                      <button
                        onClick={() => toggleItem(item)}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                          item.isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-stone-300 hover:border-brand-400"
                        )}
                      >
                        {item.isCompleted && (
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-sm text-stone-800", item.isCompleted && "line-through")}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-stone-400 mt-0.5">{item.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.category && (
                          <span className="text-xs text-stone-400 bg-stone-50 border border-stone-100 rounded px-2 py-0.5">
                            {item.category}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className={cn(
                            "text-xs",
                            overdue ? "text-red-500 font-medium" : "text-stone-400"
                          )}>
                            {relativeDays(item.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add custom task modal */}
      <Dialog.Root open={addModalOpen} onOpenChange={setAddModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 focus:outline-none">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="font-serif text-xl font-semibold text-stone-900">
                Add custom task
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
            <form onSubmit={addCustomTask} className="space-y-4">
              <div>
                <label className="label" htmlFor="taskTitle">Task title</label>
                <input
                  id="taskTitle"
                  className="input"
                  placeholder="e.g. Book rehearsal dinner"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="taskCategory">Category (optional)</label>
                <input
                  id="taskCategory"
                  className="input"
                  placeholder="e.g. Venue"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="taskDue">Due date (optional)</label>
                <input
                  id="taskDue"
                  className="input"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Dialog.Close asChild>
                  <button type="button" className="btn-ghost flex-1">Cancel</button>
                </Dialog.Close>
                <button type="submit" disabled={saving} className="btn-primary flex-[2]">
                  {saving ? "Adding..." : "Add task"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
