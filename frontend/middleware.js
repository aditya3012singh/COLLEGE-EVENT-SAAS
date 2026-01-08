import { NextResponse } from "next/server";

/**
 * Role-based access control configuration
 * Maps protected routes to allowed roles
 */
const ROLE_BASED_ROUTES = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/organiser": ["ORGANIZER"],
  "/dashboard/student": ["STUDENT"],
};

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ["/auth", "/auth/login", "/auth/register", "/"];

/**
 * Get user data from cookies or localStorage (server-side)
 * In Next.js middleware, we can only access cookies
 */
function getUserFromRequest(request) {
  try {
    // Check if user data is stored in a cookie
    const userCookie = request.cookies.get("user");
    if (userCookie) {
      return JSON.parse(userCookie.value);
    }
    return null;
  } catch (error) {
    console.error("Error parsing user from cookie:", error);
    return null;
  }
}

/**
 * Check if the route is public
 */
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Get the redirect path based on user role
 */
function getRoleBasedRedirect(role) {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "ORGANIZER":
      return "/dashboard/organiser";
    case "STUDENT":
      return "/dashboard/student";
    default:
      return "/auth/login";
  }
}

/**
 * Check if user has access to the requested route
 */
function hasAccess(pathname, userRole) {
  // Check if the route requires specific role
  for (const [route, allowedRoles] of Object.entries(ROLE_BASED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }
  // If route is not in ROLE_BASED_ROUTES, allow access
  return true;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get user from request
  const user = getUserFromRequest(request);

  // If user is not authenticated, redirect to login
  if (!user || !user.role) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is trying to access dashboard root
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const roleBasedPath = getRoleBasedRedirect(user.role);
    return NextResponse.redirect(new URL(roleBasedPath, request.url));
  }

  // Check if user has access to the requested route
  if (!hasAccess(pathname, user.role)) {
    // Redirect to their appropriate dashboard
    const roleBasedPath = getRoleBasedRedirect(user.role);
    return NextResponse.redirect(new URL(roleBasedPath, request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
