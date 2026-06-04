import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getNextAuthSecret, isGoogleOAuthEnabled } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.parse(credentials);
      const user = await prisma.user.findUnique({
        where: { email: parsed.email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          avatar: true,
          emailVerified: true,
        },
      });

      if (!user?.password) return null;
      const valid = await bcrypt.compare(parsed.password, user.password);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar ?? null,
        role: user.role,
        emailVerified: user.emailVerified,
        provider: "credentials",
      };
    },
  }),
];

if (isGoogleOAuthEnabled()) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: getNextAuthSecret(),
  callbacks: {
    async signIn({ user, account }) {
      const authUser = user as {
        email?: string | null;
        id?: string;
        role?: string;
        image?: string | null;
        name?: string | null;
      };
      if (account?.provider === "google") {
        const email = authUser.email ?? "";
        const existing = await prisma.user.findUnique({
          where: { email },
          select: { id: true, role: true },
        });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              avatar: authUser.image ?? undefined,
              emailVerified: true,
            },
          });
          authUser.id = existing.id;
          authUser.role = existing.role;
          return true;
        }

        const created = await prisma.user.create({
          data: {
            email,
            name: authUser.name ?? email.split("@")[0],
            password: "",
            avatar: authUser.image ?? null,
            role: "USER",
            emailVerified: true,
          },
        });

        authUser.id = created.id;
        authUser.role = "USER";
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      const authUser = user as { id?: string; role?: string; image?: string | null };
      if (user) {
        token.userId = (authUser.id as string) ?? token.sub;
        token.role = (authUser.role as string) ?? token.role ?? "USER";
        token.provider = account?.provider ?? "credentials";
        token.picture = authUser.image ?? token.picture;
      }

      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.image) token.picture = session.user.image;
        if ((session.user as { role?: string })?.role) {
          token.role = (session.user as { role?: string }).role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as {
          id?: string;
          role?: string;
          provider?: string;
          isVerified?: boolean;
        };
        sessionUser.id = token.userId as string;
        sessionUser.role = (token.role as string) ?? "USER";
        sessionUser.provider = (token.provider as string) ?? "credentials";
        sessionUser.isVerified = Boolean(token.isVerified);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

export const authHandler = NextAuth(authOptions);

export default authOptions;
