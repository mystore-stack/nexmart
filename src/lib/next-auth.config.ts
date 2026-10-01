import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getNextAuthSecret, isGoogleOAuthEnabled } from "@/lib/env";
import { generateAuthRequestId, authDebug, logUserInfo } from "@/lib/auth-debug";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  events: {
    async signOut() {
      console.log("[LOGOUT NEXTAUTH] SignOut event triggered");
      console.log("[LOGOUT NEXTAUTH] Session invalidated successfully");
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        csrfToken: { label: "CSRF Token", type: "hidden" },
      },
      async authorize(credentials) {
        try {
          console.log("[NEXTAUTH CREDENTIALS] Authorize called with:", { 
            email: credentials?.email,
            hasPassword: !!credentials?.password 
          });

          const parsed = credentialsSchema.parse(credentials);
          // Normalize email to lowercase for case-insensitive comparison
          const normalizedEmail = parsed.email.toLowerCase();
          console.log("[NEXTAUTH CREDENTIALS] Credentials validated:", { email: parsed.email, normalizedEmail });

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
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

          console.log("[NEXTAUTH CREDENTIALS] User lookup result:", {
            found: !!user,
            hasPassword: !!user?.password,
            email: user?.email,
            userId: user?.id
          });

          if (!user?.password) {
            console.log("[NEXTAUTH CREDENTIALS] User not found or has no password");
            return null;
          }

          console.log("[NEXTAUTH CREDENTIALS] Comparing passwords");
          const valid = await bcrypt.compare(parsed.password, user.password);
          console.log("[NEXTAUTH CREDENTIALS] Password comparison result:", { 
            valid, 
            inputPasswordLength: parsed.password.length,
            storedPasswordLength: user.password.length 
          });

          if (!valid) {
            console.log("[NEXTAUTH CREDENTIALS] Invalid password");
            return null;
          }

          const result = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar ?? null,
            role: user.role,
            emailVerified: user.emailVerified,
            provider: "credentials",
          };

          console.log("[NEXTAUTH CREDENTIALS] Authorization successful:", {
            userId: result.id,
            email: result.email,
            role: result.role
          });

          return result;
        } catch (error) {
          console.error("[NEXTAUTH CREDENTIALS] Authorize error:", error);
          throw error;
        }
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
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      const requestId = generateAuthRequestId();
      console.log("[NEXTAUTH SIGN IN] === SIGN IN CALLBACK ===");
      authDebug("NEXTAUTH_SIGNIN", {
        requestId,
        provider: account?.provider,
        ...logUserInfo(user),
      });
      
      const authUser = user as {
        email?: string | null;
        id?: string;
        role?: string;
        image?: string | null;
        name?: string | null;
      };
      console.log("[NEXTAUTH SIGN IN] User:", {
        hasEmail: !!authUser.email,
        hasId: !!authUser.id,
        provider: account?.provider
      });

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
      console.log("[NEXTAUTH SIGN IN] === SIGN IN CALLBACK END ===");
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      const requestId = generateAuthRequestId();
      console.log("[NEXTAUTH JWT] === JWT CALLBACK ===", {
        hasUser: !!user,
        hasAccount: !!account,
        trigger,
        existingTokenUserId: token.userId
      });
      authDebug("NEXTAUTH_JWT", {
        requestId,
        hasUser: !!user,
        trigger,
        existingUserId: token.userId,
      });

      const authUser = user as { id?: string; role?: string; image?: string | null };
      if (user) {
        // CRITICAL FIX: Never fall back to token.sub (OAuth provider ID)
        // Only use authUser.id which is guaranteed to be a database user ID
        if (!authUser.id) {
          console.error("[NEXTAUTH JWT] user.id is missing, cannot create valid token");
          throw new Error("User ID is required for JWT token creation");
        }
        token.userId = authUser.id as string;
        token.role = (authUser.role as string) ?? token.role ?? "USER";
        token.provider = account?.provider ?? "credentials";
        token.picture = authUser.image ?? token.picture;

        console.log("[NEXTAUTH JWT] JWT token created:", {
          userId: token.userId,
          role: token.role,
          provider: token.provider,
        });
      }

      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.image) token.picture = session.user.image;
        if ((session.user as { role?: string })?.role) {
          token.role = (session.user as { role?: string }).role ?? token.role;
        }
        console.log("[NEXTAUTH JWT] JWT token updated via trigger:", { trigger });
      }

      console.log("[NEXTAUTH JWT] JWT token final state:", {
        userId: token.userId,
        role: token.role,
        provider: token.provider,
      });

      console.log("[NEXTAUTH JWT] === JWT CALLBACK END ===");
      return token;
    },

    async session({ session, token }) {
      const requestId = generateAuthRequestId();
      console.log("[NEXTAUTH SESSION] === SESSION CALLBACK ===", {
        hasToken: !!token,
        hasSession: !!session,
        hasSessionUser: !!session.user,
        hasTokenUserId: !!token.userId,
        tokenUserId: token.userId
      });
      authDebug("NEXTAUTH_SESSION", {
        requestId,
        tokenUserId: token.userId,
        tokenRole: token.role,
      });

      if (session.user && token.userId) {
        const user = session.user as any;
        user.id = token.userId as string;
        user.role = (token.role as string) ?? "USER";
        user.provider = (token.provider as string) ?? "credentials";
        user.isVerified = Boolean(token.isVerified);

        console.log("[NEXTAUTH SESSION] Session user populated:", {
          id: user.id,
          email: user.email,
          role: user.role,
        });
      } else {
        console.error("[NEXTAUTH SESSION] Session callback failed - missing session.user or token.userId", {
          hasSessionUser: !!session.user,
          hasTokenUserId: !!token.userId,
        });
      }

      console.log("[NEXTAUTH SESSION] === SESSION CALLBACK END ===");
      return session;
    },
  },
  debug: false,
});
