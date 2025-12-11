import { getUserFriendlyMessage } from "@/lib/errors";

interface GenerationErrorProps {
  error: Error;
  retryCount: number;
  isPending?: boolean;
  isRetrying?: boolean;
  onRetry: () => void;
}

export function GenerationError({
  error,
  retryCount,
  isPending,
  onRetry,
}: GenerationErrorProps) {
  return (
    <div className="p-6 bg-red-900/20 border border-red-500/20 rounded-2xl backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-semibold text-red-400 mb-2">
            Generation Failed
          </h4>
          <p className="text-surface-300 text-sm mb-4">
            {getUserFriendlyMessage(error)}
          </p>

          {retryCount > 0 && (
            <p className="text-surface-500 text-xs mb-4">
              Retry attempt: {retryCount}
            </p>
          )}

          <button
            onClick={(e) => {
                e.preventDefault();
                onRetry();
            }}
            disabled={isPending}
            className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Retrying..." : "Try Again →"}
          </button>
        </div>
      </div>
    </div>
  );
}
