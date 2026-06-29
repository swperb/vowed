import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { sendAdminNotification } from "@/lib/email";

const schema = z.object({
  businessName: z.string().min(1).max(200),
  category: z.string().min(1).max(80),
  email: z.string().email().max(200),
  website: z.string().max(200).optional(),
  region: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`vendors:${clientIp(req)}`))) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  const { businessName, category, email, website, region } = parsed.data;

  await sendAdminNotification(
    `New vendor inquiry: ${businessName}`,
    [
      `Business: ${businessName}`,
      `Category: ${category}`,
      `Email: ${email}`,
      `Website: ${website || "(none)"}`,
      `Region: ${region || "(none)"}`,
    ].join("\n")
  );

  return NextResponse.json({ success: true });
}
