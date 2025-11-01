// app/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import prisma from "../lib/prisma";
import bcrypt from 'bcrypt';
import { loginSchema } from "../lib/validation";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        try {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials");
        }

        // Validate email format
        const validationResult = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0];
          throw new Error(firstError.message);
        }

        const { email, password } = validationResult.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          // Throw CredentialsSignin error with specific message
          throw new CredentialsSignin("Invalid email or password");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          // Throw CredentialsSignin error with specific message
          throw new CredentialsSignin("Invalid email or password");
        }

        return { id: user.id, email: user.email, name: user.name };
        } catch (error: any) {
          // If it's already a CredentialsSignin error, re-throw it
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          // For other errors, wrap with CredentialsSignin
          throw new CredentialsSignin(error.message || "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth", // Your frontend login page
  },
  secret: process.env.NEXTAUTH_SECRET,
});