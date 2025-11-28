import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: string
            /** The user's id (MongoDB _id). */
            id: string
            /** The custom user id (user_XXX). */
            userId: string
            /** The custom company id (company_XXX). */
            companyId?: string
            /** Bank connection status */
            isBankConnected?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        id: string
        userId: string
        companyId?: string
        isBankConnected?: boolean
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role: string
        id: string
        userId: string
        companyId?: string
        isBankConnected?: boolean
    }
}
