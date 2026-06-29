import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Vowed",
  description: "How Vowed collects, uses, and protects your data and your guests' data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-100 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-900">
          <HeartHandshake className="w-5 h-5 text-brand-600" />
          <span className="font-serif text-lg font-semibold">Vowed</span>
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-4 py-12 prose-vowed">
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-stone-400 mb-8">Last updated: June 29, 2026</p>

        <div className="space-y-6 text-stone-700 leading-relaxed">
          <p>
            Vowed is a free, open-source wedding planning app. This policy explains what we collect,
            why, and the choices you have. We try to collect as little as possible.
          </p>

          <Section title="Information you provide">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account details.</strong> When you sign up, our auth provider (Clerk) stores your name, email, and login credentials.</li>
              <li><strong>Wedding details.</strong> Partner names, date, venue, city, and your public website slug.</li>
              <li><strong>Guest information you enter.</strong> Names, emails, phone numbers, mailing addresses, meal choices, and notes about your guests and groups.</li>
              <li><strong>Budget and checklist data</strong> you create in the app.</li>
            </ul>
          </Section>

          <Section title="Information from your guests">
            <p>
              When a guest responds on your public RSVP page, we store their RSVP status and meal
              choice against the record you created for them. Guests do not create accounts.
            </p>
          </Section>

          <Section title="How we use it">
            <p>
              To provide the service: showing your guest list, budget, checklist, and powering your
              public RSVP page. If email is enabled, to send RSVP confirmations. We do not sell your
              data, show ads, or steer you toward paid vendors.
            </p>
          </Section>

          <Section title="Service providers">
            <p>We share data only with the infrastructure needed to run Vowed:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Clerk</strong> for authentication.</li>
              <li><strong>Turso</strong> for the database.</li>
              <li><strong>Vercel</strong> for hosting.</li>
              <li><strong>Resend</strong> for transactional email, if enabled.</li>
            </ul>
          </Section>

          <Section title="Your responsibilities for guest data">
            <p>
              You are responsible for the personal information you enter about your guests, including
              having a reasonable basis to store it. You can edit or delete any guest record at any time.
            </p>
          </Section>

          <Section title="Data retention and deletion">
            <p>
              Your data is kept while your account is active. You can delete individual records in the
              app, or request full account deletion by contacting us, after which we remove your wedding
              data and associated guest records.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              Depending on where you live, you may have rights to access, correct, export, or delete
              your personal data. Contact us to exercise them.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Email{" "}
              <a href="mailto:privacy@vowed.love" className="text-brand-600 hover:text-brand-700">privacy@vowed.love</a>.
            </p>
          </Section>

          <p className="text-sm text-stone-400 pt-4">
            Vowed is open source. This policy is a starting point and not legal advice; review it with
            counsel before relying on it for your jurisdiction.
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
