import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { sendAdminNotification } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1).max(120),
  business: z.string().max(200).optional(),
  clientCount: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
  email: z.string().email().max(200),
});

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`planners:${clientIp(req)}`))) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  const { name, business, clientCount, message, email } = parsed.data;

  await sendAdminNotification(
    `New planner waitlist signup: ${name}`,
    [
      `Name: ${name}`,
      `Business: ${business || "(none)"}`,
      `Email: ${email}`,
      `Number of clients: ${clientCount || "(not specified)"}`,
      `Message: ${message || "(none)"}`,
    ].join("\n")
  );

  return NextResponse.json({ success: true });
}
