/**
 * Error handling utilities including retry logic and exponential backoff
 */

import { BAMLGenerationError, APIConnectionError, TimeoutError } from './errors';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Exponential backoff retry logic
 * Delays: 1s, 3s, 9s by default (configurable)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    onRetry
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry validation errors (they won't succeed on retry)
      if (error instanceof Error && error.name === 'ValidationError') {
        throw error;
      }
      
      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        initialDelayMs * Math.pow(3, attempt),
        maxDelayMs
      );
      
      // Notify caller of retry
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError!;
}

/**
 * Timeout wrapper for promises
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(
          errorMessage || `Operation timed out after ${timeoutMs}ms`,
          timeoutMs
        )),
        timeoutMs
      )
    )
  ]);
}

/**
 * Section-level error boundary for partial failures
 * Returns successful results and collects errors for failed sections
 */
export async function handlePartialFailures<T extends Record<string, any>>(
  tasks: Record<string, () => Promise<any>>,
  fallbacks?: Partial<T>
): Promise<{ results: Partial<T>; errors: Record<string, Error> }> {
  const results: Partial<T> = {};
  const errors: Record<string, Error> = {};
  
  await Promise.allSettled(
    Object.entries(tasks).map(async ([key, task]) => {
      try {
        results[key as keyof T] = await task();
      } catch (error) {
        errors[key] = error instanceof Error ? error : new Error(String(error));
        
        // Use fallback if provided
        if (fallbacks && key in fallbacks) {
          results[key as keyof T] = fallbacks[key as keyof T];
        }
      }
    })
  );
  
  return { results, errors };
}

/**
 * Analytics/logging helper for errors
 */
export function logError(error: Error, context?: Record<string, any>) {
  // In production, this would send to Sentry, PostHog, etc.
  console.error('Error logged:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // TODO: Integrate with analytics service
  // analytics.trackError(error, context);
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof APIConnectionError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof BAMLGenerationError) return true;
  
  // Check for network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('fetch')
    );
  }
  
  return false;
}
