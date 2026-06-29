import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Vowed",
  description: "The terms for using Vowed.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-100 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-900">
          <HeartHandshake className="w-5 h-5 text-brand-600" />
          <span className="font-serif text-lg font-semibold">Vowed</span>
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-stone-400 mb-8">Last updated: June 29, 2026</p>

        <div className="space-y-6 text-stone-700 leading-relaxed">
          <p>
            By using Vowed you agree to these terms. Vowed is free, open-source software provided to
            help you plan a wedding.
          </p>

          <Section title="Your account">
            <p>
              You are responsible for your account and for keeping your login secure. You must provide
              accurate information and be old enough to form a binding contract where you live.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>
              Do not use Vowed to break the law, infringe others' rights, send spam, or attempt to
              disrupt the service. Only store guest information you have a reasonable basis to hold.
            </p>
          </Section>

          <Section title="Your content">
            <p>
              You own the data you put into Vowed. You grant us only the permission needed to store and
              display it back to you and, for RSVP pages, to your guests.
            </p>
          </Section>

          <Section title="Availability">
            <p>
              We aim to keep Vowed running but it is provided on an "as is" and "as available" basis,
              without warranties of any kind. Free tiers of our providers may impose limits.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, Vowed and its contributors are not liable for any
              indirect or consequential damages, or for lost data, arising from your use of the service.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these terms. Continued use after a change means you accept the updated terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email{" "}
              <a href="mailto:hello@vowed.love" className="text-brand-600 hover:text-brand-700">hello@vowed.love</a>.
            </p>
          </Section>

          <p className="text-sm text-stone-400 pt-4">
            Vowed is open source under the MIT license. These terms are a starting point and not legal
            advice; review them with counsel before relying on them.
          </p>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-stone-900 mb-2">{title}</h2>
      {children}
    </section>
  );
}
