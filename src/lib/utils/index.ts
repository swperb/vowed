import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple ID generator (use nanoid in production)
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format percent
export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// Days until wedding
export function daysUntilWedding(weddingDate: string | null | undefined): number | null {
  if (!weddingDate) return null;
  const diff = new Date(weddingDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Wedding slug from partner names
export function generateSlug(a: string, b: string): string {
  const clean = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${clean(a)}-${clean(b)}`;
}

// Guest display name
export function guestDisplayName(firstName: string, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ");
}

// RSVP status label
export function rsvpLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Awaiting RSVP",
    attending: "Attending",
    declined: "Declined",
    maybe: "Maybe",
  };
  return labels[status] ?? status;
}

// RSVP status color class
export function rsvpColor(status: string): string {
  const colors: Record<string, string> = {
    attending: "text-emerald-600 bg-emerald-50 border-emerald-200",
    declined: "text-red-600 bg-red-50 border-red-200",
    pending: "text-amber-600 bg-amber-50 border-amber-200",
    maybe: "text-blue-600 bg-blue-50 border-blue-200",
  };
  return colors[status] ?? "text-gray-600 bg-gray-50 border-gray-200";
}

// Compute due date from wedding date and offset
export function computeDueDate(weddingDate: string, offsetDays: number): string {
  const date = new Date(weddingDate);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

// Is task overdue?
export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

// Relative time string
export function relativeDays(dueDate: string | null | undefined): string {
  if (!dueDate) return "";
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}
