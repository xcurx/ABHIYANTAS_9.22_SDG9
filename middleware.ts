import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/auth/error", "/auth/verify-request"];

// Public pages that anyone can view (including unauthenticated users)
const publicPages = ["/hackathons", "/organizations", "/coding-contests"];

// Routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
    "/admin": ["SUPER_ADMIN"],
    "/organizer": ["SUPER_ADMIN", "ORGANIZATION_ADMIN"],
    "/mentor-dashboard": ["SUPER_ADMIN", "MENTOR"],
    "/judge-dashboard": ["SUPER_ADMIN", "JUDGE"],
};

export default auth(async (req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    // Check if the route is public auth pages
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // Check if the route is a public viewing page
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));
    
    // Allow access to home page
    if (pathname === "/") {
        return NextResponse.next();
    }

    // Allow access to public pages (hackathons listing, etc.)
    if (isPublicPage) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to sign-in (except for public routes)
    if (!session && !isPublicRoute) {
        const signInUrl = new URL("/sign-in", req.nextUrl.origin);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Redirect authenticated users away from auth pages
    if (session && isPublicRoute) {
        const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
        return NextResponse.redirect(dashboardUrl);
    }

    // Role-based access control
    if (session) {
        for (const [routePrefix, allowedRoles] of Object.entries(roleBasedRoutes)) {
            if (pathname.startsWith(routePrefix)) {
                const userRole = session.user?.role as string;
                if (!userRole || !allowedRoles.includes(userRole)) {
                    // Redirect to dashboard with access denied message
                    const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
                    dashboardUrl.searchParams.set("error", "access-denied");
                    return NextResponse.redirect(dashboardUrl);
                }
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)"],
};