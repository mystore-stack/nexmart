"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, User, MapPinned, ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

const fieldIcons = {
  name: User,
  phone: Phone,
  line1: MapPin,
  line2: MapPinned,
  city: MapPin,
  state: MapPin,
  zip: MapPinned,
};

const fieldLabels = {
  name: "Nom complet",
  phone: "Téléphone",
  line1: "Adresse ligne 1",
  line2: "Adresse ligne 2 (optionnel)",
  city: "Ville",
  state: "Région",
  zip: "Code postal",
};

export default function NewAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/account";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "Casablanca",
    state: "Casablanca-Settat",
    country: "Maroc",
    zip: "20000",
    isDefault: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        toast.success("Adresse enregistrée avec succès!");
        setTimeout(() => router.push(from), 800);
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main section max-w-lg">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link
          href={from}
          className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 transition-colors mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <h1 className="text-3xl font-bold font-display text-foreground">Nouvelle adresse</h1>
        <p className="text-muted-foreground mt-2">Ajoutez une adresse de livraison pour votre commande</p>
      </motion.div>

      {/* Form Card */}
      <motion.form
        onSubmit={submit}
        className="bg-card card-luxury p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="space-y-6">
          {/* Form fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(["name", "phone", "line1", "line2", "city", "state", "zip"] as const).map((field, idx) => {
              const Icon = fieldIcons[field];
              const isFullWidth = field === "line1" || field === "line2";
              
              return (
                <motion.div
                  key={field}
                  className={isFullWidth ? "md:col-span-2" : ""}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <label className="block text-sm font-semibold text-foreground mb-2.5 capitalize">
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-brand-500" />
                      {fieldLabels[field]}
                    </span>
                  </label>
                  <input
                    type={field === "phone" ? "tel" : "text"}
                    className="input w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required={field !== "line2"}
                    placeholder={field === "line2" ? "Exemple: Appartement 5, Étage 2" : ""}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Default address checkbox */}
          <motion.label
            className="flex items-center gap-3 p-4 rounded-xl bg-brand-50 border border-brand-200 cursor-pointer hover:bg-brand-100 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-5 h-5 accent-brand-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">Définir comme adresse par défaut</span>
          </motion.label>

          {/* Buttons */}
          <motion.div
            className="flex gap-3 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              type="submit"
              disabled={loading || success}
              className={`flex-1 btn btn-primary justify-center relative overflow-hidden transition-all ${
                loading ? "loading" : ""
              } ${success ? "bg-green-500 hover:bg-green-500" : ""}`}
            >
              {success ? (
                <motion.span
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Check className="w-5 h-5" />
                  Adresse enregistrée!
                </motion.span>
              ) : loading ? (
                <span className="opacity-0">Enregistrement...</span>
              ) : (
                "Enregistrer l'adresse"
              )}
            </button>
            <Link
              href={from}
              className="btn btn-outline justify-center px-6"
            >
              Annuler
            </Link>
          </motion.div>
        </div>
      </motion.form>

      {/* Info box */}
      <motion.div
        className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-medium mb-1">💡 Conseil:</p>
        <p>Assurez-vous que l&apos;adresse est exacte pour éviter les retards de livraison.</p>
      </motion.div>
    </div>
  );
}
