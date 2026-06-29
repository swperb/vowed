import { NextResponse } from "next/server";
import { z } from "zod";

// Parse and validate a JSON request body. Returns either the typed data or a
// ready-to-return 400 response, so routes never insert unvalidated input.
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: NextResponse }> {
  const json = await req.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) {
    return { data: null, error: NextResponse.json({ error: "Invalid request" }, { status: 400 }) };
  }
  return { data: result.data, error: null };
}

export const rsvpStatusEnum = z.enum(["pending", "attending", "declined", "maybe"]);
export const sideEnum = z.enum(["partner_a", "partner_b", "shared"]);
export const roleEnum = z.enum(["guest", "wedding_party", "family", "vendor", "officiant"]);
export const vendorStatusEnum = z.enum(["favorite", "contacted", "booked", "passed"]);
