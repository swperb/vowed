"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { weddings } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

function slugifyNames(a: string, b: string): string {
  const clean = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const base = `${clean(a)}-${clean(b)}`.replace(/^-+|-+$/g, "");
  return base || "our-wedding";
}

function randomSuffix(len = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Globally-unique slug: base names + a random suffix. Identical names no longer
// collide, and on the astronomically rare suffix collision we regenerate.
async function uniqueSlug(base: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${base}-${randomSuffix(6)}`;
    const taken = await db.query.weddings.findFirst({
      where: eq(weddings.websiteSlug, candidate),
      columns: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${randomSuffix(12)}`;
}

export async function createWedding(
  formData: FormData
): Promise<{ error: string } | void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Idempotent: a user gets one wedding. If they already have one, just go in.
  const existing = await db.query.weddings.findFirst({
    where: eq(weddings.clerkUserId, userId),
    columns: { id: true },
  });
  if (existing) redirect("/dashboard");

  const partnerAName = ((formData.get("partnerAName") as string) ?? "").trim();
  const partnerBName = ((formData.get("partnerBName") as string) ?? "").trim();
  if (!partnerAName || !partnerBName) {
    return { error: "Please enter both partner names." };
  }

  const weddingDate = (formData.get("weddingDate") as string) || null;
  const venue = (formData.get("venue") as string) || null;
  const city = (formData.get("city") as string) || null;

  const edited = ((formData.get("websiteSlug") as string) ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = edited || slugifyNames(partnerAName, partnerBName);
  const websiteSlug = await uniqueSlug(base);

  try {
    await db.insert(weddings).values({
      id: generateId(),
      clerkUserId: userId,
      partnerAName,
      partnerBName,
      weddingDate,
      venue,
      city,
      websiteSlug,
    });
  } catch (err) {
    console.error("createWedding failed:", err);
    return { error: "Something went wrong creating your wedding. Please try again." };
  }

  redirect("/dashboard");
}
