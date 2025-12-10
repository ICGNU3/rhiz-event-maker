import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Fallback: If CLERK_SECRET_KEY is missing on Vercel, disable auth middleware to prevent 500 crash.
// (The hardcoded publishableKey handles client-side, but server-side needs the secret).
const hasSecretKey = !!process.env.CLERK_SECRET_KEY;

export default hasSecretKey 
  ? clerkMiddleware({
      publishableKey: "pk_test_bWVldC1oeWVuYS01NC5jbGVyay5hY2NvdW50cy5kZXYk",
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
