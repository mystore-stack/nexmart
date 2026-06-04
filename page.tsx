"use client";
/**
 * LoginPage — NexMart Enterprise Auth
 * Premium Stripe/Linear-level login with:
 * - Google OAuth via NextAuth
 * - Credentials fallback
 * - Beautiful animations + WCAG 2.1 AA
 */
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/store/index";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.ok) {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) { const me = await meRes.json(); if (me.user) setUser(me.user); }
        toast.success("Welcome back! 👋");
        router.push(from); router.refresh();
      } else {
        // Legacy API fallback
        const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const data = await res.json();
        if (data.success) { setUser(data.data?.user ?? data.user); toast.success("Welcome back! 👋"); router.push(from); router.refresh(); }
        else setError(data.error || "Invalid email or password");
      }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-brand-400/20 to-transparent blur-xl pointer-events-none" />
        <div className="bg-card border border-border rounded-2xl p-8 shadow-luxury relative">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex">
              <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 hover:bg-brand-500 transition-colors">
                <span className="text-background font-black text-xl font-display">N</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your NexMart account</p>
          </div>
          <GoogleSignInButton redirectTo={from} label="Continue with Google" size="md" />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or sign in with email</span></div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" required className="input pl-10" autoComplete="email" autoFocus />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input id="password" type={showPw ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" required className="input pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !form.email || !form.password} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>
                : <span className="flex items-center gap-2">Sign In<ArrowRight className="w-4 h-4" /></span>}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />SSL Secured</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-brand-500" />Trusted by 50k+ shoppers</span>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-5 pt-5 border-t border-border">
            Don&apos;t have an account?{" "}
            <Link href={`/register${from !== "/" ? `?from=${from}` : ""}`} className="text-brand-500 font-semibold hover:text-brand-600 transition-colors">Create one free</Link>
          </p>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-4 p-4 bg-muted/50 rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Demo Credentials</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p><span className="font-mono bg-background px-1.5 py-0.5 rounded">admin@nexmart.com</span> / Admin@123456</p>
            <p><span className="font-mono bg-background px-1.5 py-0.5 rounded">user@nexmart.com</span> / User@123456</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
