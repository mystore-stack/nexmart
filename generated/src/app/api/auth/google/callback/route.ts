import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateTokenPair, setAuthCookies } from "@/lib/auth";
import { getRequiredEnv } from "@/lib/env";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const STATE_COOKIE = "nexmart_google_oauth_state";

type GoogleState = {
  state: string;
  from: string;
};

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

function safeRedirectPath(path: string | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function readState(raw: string | undefined): GoogleState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleState;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const storedState = readState(req.cookies.get(STATE_COOKIE)?.value);

  if (!code || !returnedState || !storedState || returnedState !== storedState.state) {
    return NextResponse.redirect(new URL("/login?error=google_state", req.url));
  }

  try {
    const redirectUri = `${getBaseUrl(req)}/api/auth/google/callback`;
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: getRequiredEnv("GOOGLE_CLIENT_ID"),
        client_secret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("Google token exchange failed");
    const tokens = await tokenRes.json();

    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) throw new Error("Google profile fetch failed");

    const profile = (await profileRes.json()) as GoogleProfile;
    if (!profile.email || !profile.email_verified) {
      return NextResponse.redirect(new URL("/login?error=google_email", req.url));
    }

    const randomPassword = await bcrypt.hash(crypto.randomUUID(), 12);
    const user = await prisma.user.upsert({
      where: { email: profile.email.toLowerCase() },
      update: {
        name: profile.name || profile.email.split("@")[0],
        avatar: profile.picture,
        emailVerified: true,
      },
      create: {
        email: profile.email.toLowerCase(),
        name: profile.name || profile.email.split("@")[0],
        avatar: profile.picture,
        emailVerified: true,
        password: randomPassword,
      },
      select: { id: true, email: true, name: true, role: true, avatar: true },
    });

    const { accessToken, refreshToken } = await generateTokenPair(user);
    setAuthCookies(accessToken, refreshToken);

    const loginUrl = new URL("/auth/google/success", req.url);
    loginUrl.searchParams.set("from", safeRedirectPath(storedState.from));

    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }
}
