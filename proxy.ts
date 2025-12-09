import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publishableKey: "pk_test_bWVldC1oeWVuYS01NC5jbGVyay5hY2NvdW50cy5kZXYk",
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
