import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import prisma from "./lib/prisma"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
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
            email: {
              type: "email",
              label: "Email",
              placeholder: "Enter your email",
            },
            password: {
              type: "password",
              label: "Password",
              placeholder: "Enter password",
            },
        },
        
        authorize: async (credentials) => {
            if (!credentials?.email || !credentials?.password) {
                return null
            }

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
            })

            if (!user || !user.password) {
                return null
            }

            const isPasswordValid = await bcrypt.compare(
                credentials.password as string,
                user.password
            )

            if (!isPasswordValid) {
                return null
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            }
        }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in - create user if doesn't exist
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              avatar: user.image,
              emailVerified: new Date(),
              role: "PARTICIPANT",
            },
          })
        }
      }
      return true
    },
    async session({ session, token }) {
        return {
            ...session,
            user: {
                id: token.id as string,
                email: session.user?.email || "",
                name: session.user?.name || "",
                role: token.role as UserRole,
                avatar: token.avatar as string | null,
            }
        }
    },
    async jwt({ token, user, trigger, session }) {
        if (user) {
            // Fetch user from database to get role
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email! },
                select: { id: true, role: true, avatar: true },
            })
            token.id = dbUser?.id || user.id
            token.role = dbUser?.role || "PARTICIPANT"
            token.avatar = dbUser?.avatar || user.avatar
        }
        
        // Handle session update (e.g., profile changes)
        if (trigger === "update" && session) {
            token.name = session.name
            token.avatar = session.avatar
        }
        
        return token
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  secret: process.env.AUTH_SECRET,
})