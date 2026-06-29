import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/rsvp/(.*)",
  "/w/(.*)",
  "/api/rsvp/(.*)",
  "/privacy",
  "/terms",
  "/opengraph-image(.*)",
  "/vendors",
  "/planners",
  "/api/vendors",
  "/api/planners",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
