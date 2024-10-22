import { NextResponse } from "next/server"
import  authConfig  from "@/auth.config"
import NextAuth from "next-auth"
import { DEFAULT_LOGIN_REDIRECT, 
    publicRoutes, 
    authRoutes, 
    apiAuthPrefix } from "@/routes"
    import { rateLimit } from "@/lib/rate-limit"


    const limiter = rateLimit({
      interval: 60 * 1000, // 60 seconds
      uniqueTokenPerInterval: 500, // Max 500 users per second
    })
    
// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig)
 
// 2. Innpakket middleware-alternativ
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role ?? "admin";
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);    
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const remaining = limiter.check(req)

  if (!remaining) {
    return new NextResponse("For mange forespørsler", { status: 429 })
  }

  // Sjekk om token er utløpt
  const tokenExpiration = req.auth?.exp;
  if (tokenExpiration && Date.now() >= tokenExpiration * 1000) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  // Legg til rollebasert logikk her
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && userRole !== "admin") {
    return Response.redirect(new URL("/unauthorized", nextUrl));
  }

  if (isApiAuthRoute) { 
    return null;
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }
  if (!isPublicRoute && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
  return NextResponse.next();
}) as any;


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}