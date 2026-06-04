"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/store/index";
import type { User } from "@/types";

function SessionSync() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const bridged = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      if (status === "unauthenticated") bridged.current = false;
      return;
    }

    const sessionUser = session.user as {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isVerified?: boolean;
    };

    const user: User = {
      id: sessionUser.id as string,
      name: sessionUser.name ?? "",
      email: sessionUser.email ?? "",
      avatar: sessionUser.image ?? undefined,
      role: (sessionUser.role as User["role"]) ?? "USER",
      emailVerified: sessionUser.isVerified ?? true,
      createdAt: new Date().toISOString(),
    };

    setUser(user);

    if (!bridged.current) {
      bridged.current = true;
      fetch("/api/auth/bridge", { method: "POST", credentials: "include" }).catch(() => {});
    }
  }, [session, status, setUser]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
