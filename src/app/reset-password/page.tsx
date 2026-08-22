"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!token) {
      toast.error("Lien invalide");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mot de passe mis à jour");
        router.push("/login");
      } else {
        toast.error(data.error || "Erreur");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-luxury">
      <h1 className="text-2xl font-bold mb-2">Nouveau mot de passe</h1>
      <p className="text-sm text-muted-foreground mb-6">Choisissez un mot de passe sécurisé (8+ caractères).</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="text-sm font-medium">Confirmer</label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input w-full mt-1"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Enregistrement..." : "Réinitialiser"}
        </button>
      </form>
      <Link href="/login" className="block text-center text-sm text-muted-foreground mt-4 hover:underline">
        Retour à la connexion
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface">
      <Suspense fallback={<div className="skeleton h-64 w-full max-w-md rounded-2xl" />}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
