/**
 * Public routes are routes that are accessible to everyone
 * Auth routes are routes that require authentication
 * Protected routes are routes that are protected by the auth middleware
 */
export const publicRoutes = [
    "/", 
    "/auth/new-verification"

];
/**
 * Auth routes are routes that require authentication
 */
export const authRoutes = [
    "/auth/login",
    "/auth/register",
];
/**
 * API auth routes are routes that require authentication
 */ 
export const apiAuthPrefix = "/api/auth";
/**
 * Redirect to this route after successful login
 */

export const DEFAULT_LOGIN_REDIRECT = "/admin";
