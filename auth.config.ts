import type { NextAuthConfig } from 'next-auth';

// All protected routes (resolved by route group (dashboard))
const PROTECTED_ROUTES = ['/', '/shopping-list', '/todo', '/cookbook', '/habits'];

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = PROTECTED_ROUTES.some(
        (route) =>
          nextUrl.pathname === route ||
          (route !== '/' && nextUrl.pathname.startsWith(route + '/'))
      );

      if (isProtectedRoute) {
        // Protected routes require authentication
        if (isLoggedIn) return true;
        // Explicitly redirect unauthenticated users to /login
        return Response.redirect(new URL('/login', nextUrl));
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        // Redirect logged-in users away from login page to dashboard
        return Response.redirect(new URL('/', nextUrl));
      }
      // Allow access to public routes
      return true;
    },
  },
} satisfies NextAuthConfig;
