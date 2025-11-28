import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role;

        // Public paths handled by config matcher, but double check here if needed

        // Client Only Routes
        if (path.startsWith("/client") || path.startsWith("/clients")) {
            if (role !== "client") {
                return NextResponse.redirect(new URL("/home", req.url));
            }
        }

        // Freelancer Only Routes
        if (
            path.startsWith("/freelancer") ||
            path.startsWith("/growth") ||
            path.startsWith("/productivity") ||
            path.startsWith("/calculator") ||
            path.startsWith("/profile")
        ) {
            if (role !== "freelancer") {
                return NextResponse.redirect(new URL("/home", req.url));
            }
        }

        // Common Routes (Network, Home) are accessible to both if authenticated
        // (Handled by 'withAuth' wrapper ensuring token exists)
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/home",
        "/network",
        "/profile",
        "/growth",
        "/finance",
        "/productivity",
        "/calculator",
        "/client/:path*",
        "/freelancer/:path*",
        "/clients",
        "/notifications",
        "/settings"
    ],
};
