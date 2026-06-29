import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vowed: Wedding Planning That Respects Your Time",
  description:
    "Free, fast, and actually works. Guest lists, budget tracking, checklist, and a wedding website, without the phantom errors and ad-driven UX of the big platforms.",
  keywords: ["wedding planner", "free wedding app", "guest list", "wedding budget"],
  openGraph: {
    title: "Vowed",
    description: "Free wedding planning that actually works.",
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
        </body>
      </html>
    </ClerkProvider>
  );
}
