import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vowed.love";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Vowed: Wedding Planning That Respects Your Time",
  description:
    "Free, fast, and actually works. Guest lists, budget tracking, checklist, and a wedding website, without the phantom errors and ad-driven UX of the big platforms.",
  keywords: ["wedding planner", "free wedding app", "guest list", "wedding budget"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vowed",
    description: "Free wedding planning that actually works.",
    url: appUrl,
    siteName: "Vowed",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
