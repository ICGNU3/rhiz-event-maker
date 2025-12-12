import { LRUCache } from "lru-cache";
import { ErrorCode } from "./errors/codes";

type Options = {
  uniqueTokenPerInterval: number;
  interval: number;
};

export function rateLimit(options: Options) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (res: Response, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }
        const currentUsage = tokenCount[0];
        
        // This is a simplified simulation since we don't have response headers access easily in server actions
        // In a real middleware we would set headers:
        // X-RateLimit-Limit, X-RateLimit-Remaining

        if (currentUsage > limit) {
          reject(new Error(ErrorCode.RATE_LIMIT_EXCEEDED));
        }
        resolve();
      }),
      
    /**
     * Check limit returning boolean/info instead of Promise logic
     */
    checkLimit: async (token: string, limit: number) => {
         const tokenCount = (tokenCache.get(token) as number[]) || [0];
         if (tokenCount[0] === 0) {
           tokenCache.set(token, [1]);
         } else {
           tokenCount[0] += 1;
           tokenCache.set(token, tokenCount);
         }
         return {
             success: tokenCount[0] <= limit,
             limit,
             remaining: Math.max(0, limit - tokenCount[0])
         };
    }
  };
}

// Singleton instance for the application
export const limiter = rateLimit({
  interval: 60 * 1000 * 60, // 1 hour
  uniqueTokenPerInterval: 500,
});
