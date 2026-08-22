"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success("Vérifiez votre boîte mail");
      } else {
        toast.error(data.error || "Erreur");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-luxury">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>
        <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Entrez votre e-mail pour recevoir un lien de réinitialisation.
        </p>
        {sent ? (
          <p className="text-sm text-green-600 dark:text-green-400" role="status">
            Si un compte existe pour {email}, vous recevrez un e-mail sous peu.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
