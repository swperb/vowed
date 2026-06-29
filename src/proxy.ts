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
  "/for-vendors",
  "/for-planners",
  "/api/inquiries/vendor",
  "/api/inquiries/planner",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
