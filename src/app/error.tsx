"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="w-10 h-10 text-amber-500 mb-6" />
      <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-2">Something went wrong</h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-secondary">Back to home</Link>
      </div>
    </div>
  );
}
