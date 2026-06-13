import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getNextAuthSecret, isGoogleOAuthEnabled } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
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
    ...(isGoogleOAuthEnabled()
      ? [
          Google({
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
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: getNextAuthSecret(),
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
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
      console.log("[NEXTAUTH] JWT callback called", { 
        hasUser: !!user, 
        hasAccount: !!account,
        trigger,
        existingTokenUserId: token.userId 
      });
      
      const authUser = user as { id?: string; role?: string; image?: string | null };
      if (user) {
        // CRITICAL FIX: Never fall back to token.sub (OAuth provider ID)
        // Only use authUser.id which is guaranteed to be a database user ID
        if (!authUser.id) {
          console.error("[NEXTAUTH] JWT callback: user.id is missing, cannot create valid token");
          throw new Error("User ID is required for JWT token creation");
        }
        token.userId = authUser.id as string;
        token.role = (authUser.role as string) ?? token.role ?? "USER";
        token.provider = account?.provider ?? "credentials";
        token.picture = authUser.image ?? token.picture;
        
        console.log("[NEXTAUTH] JWT token created:", {
          userId: token.userId,
          role: token.role,
          provider: token.provider,
        });
      }

      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.image) token.picture = session.user.image;
        if ((session.user as { role?: string })?.role) {
          token.role = (session.user as { role?: string }).role;
        }
        console.log("[NEXTAUTH] JWT token updated via trigger:", { trigger });
      }

      console.log("[NEXTAUTH] JWT token final state:", {
        userId: token.userId,
        role: token.role,
        provider: token.provider,
      });
      
      return token;
    },

    async session({ session, token }) {
      console.log("[NEXTAUTH] Session callback called", { 
        hasSessionUser: !!session.user, 
        hasTokenUserId: !!token.userId,
        tokenUserId: token.userId 
      });
      
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as string) ?? "USER";
        (session.user as any).provider = (token.provider as string) ?? "credentials";
        (session.user as any).isVerified = Boolean(token.isVerified);
        
        console.log("[NEXTAUTH] Session user populated:", {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        });
      } else {
        console.error("[NEXTAUTH] Session callback failed - missing session.user or token.userId", {
          hasSessionUser: !!session.user,
          hasTokenUserId: !!token.userId,
        });
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});
