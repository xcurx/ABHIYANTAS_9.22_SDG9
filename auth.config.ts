import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

// Define UserRole type locally to avoid import issues
type UserRole = "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "MENTOR" | "JUDGE" | "PARTICIPANT" | "SPONSOR"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: UserRole
            avatar?: string | null
        }
    }

    interface User {
        id: string
        role: UserRole
        avatar?: string | null
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string
        role: UserRole
        avatar?: string | null
    }
}

// This is the edge-compatible auth config (no database imports)
// Used by middleware for session validation
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      // Note: authorize is handled in auth.ts with database access
      authorize: async () => null,
    }),
  ],
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.avatar = user.avatar
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as UserRole,
          avatar: token.avatar as string | null,
        },
      }
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig
