"use client";
// src/app/login/page.tsx — NexMart Moroccan Luxury Login
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Fetch CSRF token first
      const csrfResponse = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfResponse.json();

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        csrfToken,
        redirect: false,
      });
      if (result?.error) {
        setError("Identifiants incorrects. Veuillez réessayer.");
      } else {
        toast.success("Bienvenue !");
        router.push(from);
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-moroccan-sand dark:bg-moroccan-navy" />
      <div className="absolute inset-0 moroccan-pattern-bg opacity-20 dark:opacity-10" />
      <div className="absolute top-0 left-0 w-96 h-96 opacity-20 dark:opacity-30"
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.5) 0%, transparent 70%)", transform: "translate(-30%,-30%)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 opacity-15 dark:opacity-20"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)", transform: "translate(30%,30%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10 dark:bg-card/90">
          <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 mx-auto mb-5 shadow-brand">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <path d="M20 3 L37 20 L20 37 L3 20 Z" stroke="rgba(212,175,55,0.8)" strokeWidth="1.5" fill="none" />
                <path d="M20 10 L30 20 L20 30 L10 20 Z" stroke="rgba(212,175,55,0.5)" strokeWidth="1" fill="none" />
                <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.9)" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-semibold">Bon retour !</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Connectez-vous à votre compte NexMart</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm mb-5 border border-destructive/20"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80" htmlFor="email">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="email" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@email.com" className="input pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/80" htmlFor="password">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-brand-700 dark:text-brand-400 hover:underline font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="password" type={showPw ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="input pl-10 pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`btn btn-primary btn-lg w-full font-display text-base tracking-wide group ${loading ? "opacity-75 cursor-wait" : ""}`}>
              {loading ? "Connexion en cours…" : (
                <>Se connecter <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="relative my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-1">ou continuer avec</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <GoogleSignInButton redirectTo={from} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-brand-700 dark:text-brand-400 hover:underline">
              Créer un compte gratuitement
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
