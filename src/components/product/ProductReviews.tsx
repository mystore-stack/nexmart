"use client";
// src/components/product/ProductReviews.tsx — Moroccan Luxury Reviews
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Check } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/index";
import { formatDate } from "@/utils/format";
import type { Review } from "@/types";
import toast from "react-hot-toast";

interface Props {
  productId: string;
  initialReviews: Review[];
  rating: number;
  reviewCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "highest", label: "Mieux noté" },
  { value: "lowest", label: "Moins bien noté" },
  { value: "helpful", label: "Plus utile" },
];

export function ProductReviews({ productId, initialReviews, rating, reviewCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthStore();
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Connectez-vous pour laisser un avis"); return; }
    if (form.body.length < 10) { toast.error("L'avis doit contenir au moins 10 caractères"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((p) => [data.data, ...p]);
        setShowForm(false);
        setForm({ rating: 5, title: "", body: "" });
        toast.success("Avis publié !");
      } else {
        toast.error(data.error || "Échec de l'envoi");
      }
    } finally { setSubmitting(false); }
  };

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : rating;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div id="reviews" className="space-y-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Rating summary */}
        <div className="flex-shrink-0 md:w-64">
          <div className="rounded-2xl border border-gold-200/40 dark:border-gold-800/20 bg-white dark:bg-card p-6 text-center md:text-left"
            style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
            <div className="mb-1 font-display text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
            <div className="mb-2 flex items-center justify-center gap-1 md:justify-start">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-5 w-5 ${s <= Math.round(avgRating) ? "text-gold-500 fill-gold-500" : "text-muted-foreground/25"}`} />
              ))}
            </div>
            <p className="mb-5 text-sm text-muted-foreground">{new Intl.NumberFormat("fr-MA").format(reviewCount)} avis clients</p>

            <div className="space-y-2">
              {distribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-right text-xs text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 flex-shrink-0 fill-gold-400 text-gold-400" />
                  <div className="flex-1 overflow-hidden rounded-full h-2 bg-muted">
                    <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-xs text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary mt-6 w-full justify-center text-sm h-11">
              Écrire un avis
            </button>
          </div>
        </div>

        {/* Review list */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">Avis clients</h2>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="input w-auto min-w-[170px] py-2 text-sm">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-2xl border border-gold-200/40 dark:border-gold-800/20 bg-white dark:bg-card p-6 space-y-4"
                style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
              >
                <h3 className="font-display text-lg font-semibold">Votre avis</h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Note *</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: s }))}
                        className="transition-transform hover:scale-110">
                        <Star className={`h-7 w-7 transition-colors ${s <= form.rating ? "text-gold-500 fill-gold-500" : "text-muted-foreground/25"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Titre</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Résumez votre expérience" className="input" maxLength={100} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Avis *</label>
                  <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    placeholder="Qu'avez-vous aimé ou pas ? Quelle est la qualité ?" rows={4} required minLength={10}
                    className="input resize-none" />
                  <p className="text-right text-xs text-muted-foreground">{form.body.length}/2000</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline h-11 px-5 text-sm">Annuler</button>
                  <button type="submit" disabled={submitting}
                    className={`btn btn-primary h-11 flex-1 justify-center text-sm ${submitting ? "loading" : ""}`}>
                    {submitting ? "Envoi en cours…" : "Publier l'avis"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gold-200/50 dark:border-gold-800/30 py-14 text-center">
              <div className="mb-3 flex justify-center">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-8 w-8 text-muted-foreground/20" />)}
              </div>
              <p className="font-display text-xl font-semibold">Aucun avis pour le moment</p>
              <p className="mt-1 text-sm text-muted-foreground">Soyez le premier à partager votre expérience !</p>
            </div>
          ) : (
            <div className="space-y-1 divide-y divide-border/60">
              {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  const markHelpful = async () => {
    if (voted) return;
    setVoted(true);
    setHelpful((h) => h + 1);
    await fetch(`/api/reviews/${review.id}/helpful`, { method: "POST" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-5 first:pt-0 last:pb-0">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
          {review.user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{review.user?.name || "Anonyme"}</span>
            {review.verified && (
              <span className="flex items-center gap-1 rounded-full bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-400">
                <Check className="h-2.5 w-2.5" /> Achat vérifié
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "text-gold-500 fill-gold-500" : "text-muted-foreground/20"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {review.title && <p className="mb-2 text-sm font-semibold text-foreground">{review.title}</p>}
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>

      {review.images?.length > 0 && (
        <div className="mb-3 flex gap-2">
          {review.images.map((img, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-gold-200/30">
              <Image src={img} alt={`Avis image ${i + 1}`} fill className="object-cover" sizes="64px" />
            </div>
          ))}
        </div>
      )}

      <button onClick={markHelpful} disabled={voted}
        className={`flex items-center gap-1.5 text-xs transition-colors ${voted ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground hover:text-foreground"}`}>
        <ThumbsUp className={`h-3.5 w-3.5 ${voted ? "fill-current" : ""}`} />
        Utile ({helpful})
      </button>
    </motion.div>
  );
}
