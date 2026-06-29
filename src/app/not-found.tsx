import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
      <HeartHandshake className="w-10 h-10 text-brand-500 mb-6" />
      <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-2">Page not found</h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        We couldn't find that page. It may have moved, or the link might be incomplete.
      </p>
      <Link href="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
