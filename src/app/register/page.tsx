"use client";
// src/app/register/page.tsx — NexMart Moroccan Luxury Register
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, Check } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuthStore } from "@/store/index";
import toast from "react-hot-toast";

const PW_RULES = [
  { label: "8+ caractères", test: (p: string) => p.length >= 8 },
  { label: "Majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Minuscule", test: (p: string) => /[a-z]/.test(p) },
  { label: "Chiffre", test: (p: string) => /\d/.test(p) },
];

const STRENGTH_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-brand-600"];
const STRENGTH_LABELS = ["Faible", "Moyen", "Bien", "Fort"];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const pwStrength = PW_RULES.filter((r) => r.test(form.password)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error("Veuillez accepter les conditions."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        const user = data.user ?? data.data?.user;
        if (user) setUser(user);
        toast.success("Bienvenue sur NexMart ! 🎉");
        router.push(from); router.refresh();
      } else {
        setError(data.error || "Échec de l'inscription.");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 overflow-hidden py-10">
      <div className="absolute inset-0 bg-moroccan-sand dark:bg-moroccan-navy" />
      <div className="absolute inset-0 moroccan-pattern-bg opacity-15 dark:opacity-8" />
      <div className="absolute top-0 right-0 w-96 h-96 opacity-15"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 opacity-15"
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.5) 0%, transparent 70%)", transform: "translate(-30%,30%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10 dark:bg-card/90">
          <div className="h-px absolute top-0 inset-x-0 rounded-t-3xl bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-600 mx-auto mb-5 shadow-brand">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <path d="M20 3 L37 20 L20 37 L3 20 Z" stroke="rgba(212,175,55,0.8)" strokeWidth="1.5" fill="none" />
                <path d="M20 10 L30 20 L20 30 L10 20 Z" stroke="rgba(212,175,55,0.5)" strokeWidth="1" fill="none" />
                <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.9)" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-semibold">Créer un compte</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Rejoignez la communauté NexMart Maroc</p>
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
              <label className="text-sm font-semibold text-foreground/80" htmlFor="name">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="name" type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom" className="input pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80" htmlFor="reg-email">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="reg-email" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@email.com" className="input pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80" htmlFor="reg-pw">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="reg-pw" type={showPw ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Choisir un mot de passe" className="input pl-10 pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Force du mot de passe</span>
                    <span className={`font-bold ${pwStrength >= 3 ? "text-brand-600" : "text-muted-foreground"}`}>
                      {STRENGTH_LABELS[pwStrength - 1] || "Très faible"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < pwStrength ? STRENGTH_COLORS[pwStrength - 1] : "bg-muted"}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PW_RULES.map((r) => (
                      <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? "text-brand-600" : "text-muted-foreground"}`}>
                        <Check className={`w-3 h-3 ${r.test(form.password) ? "opacity-100" : "opacity-30"}`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${agreed ? "border-brand-600 bg-brand-600" : "border-border bg-background"}`}
                onClick={() => setAgreed(!agreed)}>
                {agreed && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm text-muted-foreground leading-snug">
                J&apos;accepte les{" "}
                <Link href="/terms" className="text-brand-700 dark:text-brand-400 hover:underline font-semibold">conditions d&apos;utilisation</Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-brand-700 dark:text-brand-400 hover:underline font-semibold">politique de confidentialité</Link>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className={`btn btn-primary btn-lg w-full font-display text-[0.95rem] tracking-wide group ${loading ? "loading" : ""}`}>
              {loading ? "Création en cours…" : (
                <>Créer mon compte <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="relative my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-1">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <GoogleSignInButton redirectTo={from} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-brand-700 dark:text-brand-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
