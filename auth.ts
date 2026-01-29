import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials" 
import prisma from "./lib/prisma";

// declare module "next-auth" {
//     interface Session {
//         user: {
//             id: string
//             email: string
//             name: string
//         }
//     }

//     interface User {
//         id: string
//     }
// }

// declare module "next-auth/jwt" {
//     interface JWT {
//         id: string
//     }
// }

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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
            console.log("Authorizing user with credentials:", credentials);

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
            });

            if (user && user.password === credentials?.password) {
                return { id: user.id, email: user.email, name: user.name };
            }

            return null;
        }
    })
  ],
  callbacks: {
    session({ session, token, user }) {
        // console.log("Session callback:", { session, token, user });
        return {
            ...session,
            user: {
                id: token.id as string,
                email: session.user?.email || "",
                name: session.user?.name || "",
            }
        }
    },
    jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
        return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 20 * 60, // 20 minutes
  },
  pages: {
    signIn: '/sign-in',
    error: '/error'
  },
  secret: process.env.AUTH_SECRET,
  jwt: {
    maxAge: 20 * 60
  }
})