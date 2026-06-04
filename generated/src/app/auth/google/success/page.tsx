"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/index";
import toast from "react-hot-toast";

function safePath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export default function GoogleAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [error, setError] = useState("");

  useEffect(() => {
    const from = safePath(searchParams.get("from"));

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const user = data.data || data.user;
        if (!data.success || !user) throw new Error("Missing user");
        setUser(user);
        toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
        router.replace(from);
        router.refresh();
      })
      .catch(() => setError("Google login worked, but your profile could not be loaded."));
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface p-4">
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-luxury max-w-sm w-full">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              !
            </div>
            <h1 className="text-xl font-bold mb-2">Google login needs one more try</h1>
            <p className="text-sm text-muted-foreground mb-5">{error}</p>
            <button onClick={() => router.replace("/login")} className="btn-primary w-full justify-center py-3">
              Back to login
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold mb-2">Google login confirmed</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your NexMart account...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
