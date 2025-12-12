"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-950 text-foreground p-6 text-center">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-300 to-brand-500 mb-4">
        Something went wrong!
      </h2>
      <p className="text-surface-300 mb-8 max-w-md">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-medium transition-all shadow-glow hover:shadow-glow-lg"
        >
          Try again
        </button>
      </div>
       <div className="mt-8 text-xs text-surface-600 font-mono">
        Error Digest: {error.digest || 'Unknown'}
      </div>
    </div>
  );
}
