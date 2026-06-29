import { SignIn } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-stone-100 bg-white px-6 py-4 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 text-stone-900">
          <Heart className="w-5 h-5 text-brand-500 fill-brand-400" />
          <span className="font-serif text-lg font-semibold">Vowed</span>
        </Link>
      </nav>

      {/* Centered sign-in */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-1">Welcome back</h1>
            <p className="text-stone-500 text-sm">Sign in to continue planning your wedding.</p>
          </div>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "card shadow-none border border-stone-100 p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "btn-secondary w-full justify-center",
                formButtonPrimary: "btn-primary w-full justify-center",
                footerActionLink: "text-brand-600 hover:text-brand-700",
                formFieldInput: "input",
                formFieldLabel: "label",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
