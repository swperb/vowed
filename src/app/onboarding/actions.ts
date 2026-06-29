"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { weddings } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

function slugify(a: string, b: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `${clean(a)}-${clean(b)}`;
}

export async function createWedding(formData: FormData) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const partnerAName = formData.get("partnerAName") as string;
  const partnerBName = formData.get("partnerBName") as string;
  const weddingDate = formData.get("weddingDate") as string | null;
  const venue = formData.get("venue") as string | null;
  const city = formData.get("city") as string | null;
  const websiteSlug = (formData.get("websiteSlug") as string) || slugify(partnerAName, partnerBName);

  const id = generateId();

  await db.insert(weddings).values({
    id,
    clerkUserId: userId,
    partnerAName: partnerAName.trim(),
    partnerBName: partnerBName.trim(),
    weddingDate: weddingDate || null,
    venue: venue || null,
    city: city || null,
    websiteSlug,
  });

  redirect("/dashboard");
}

