"use client";
// src/components/product/ProductReviews.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Check, ChevronDown, Image as ImageIcon } from "lucide-react";
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
  { value: "newest", label: "Most Recent" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
  { value: "helpful", label: "Most Helpful" },
];

export function ProductReviews({ productId, initialReviews, rating, reviewCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [ratingBreakdown, setRatingBreakdown] = useState<Array<{ star: number; count: number }>>([]);
  const { user } = useAuthStore();

  // Form state
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to leave a review"); return; }
    if (form.body.length < 10) { toast.error("Review must be at least 10 characters"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [data.data, ...prev]);
        setShowForm(false);
        setForm({ rating: 5, title: "", body: "" });
        toast.success("Review submitted!");
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalStars = reviews.reduce((s, r) => s + r.rating, 0);
  const avgRating = reviews.length ? totalStars / reviews.length : rating;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div id="reviews" className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Rating summary */}
        <div className="md:w-64 flex-shrink-0">
          <div className="text-center md:text-left mb-4">
            <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center md:justify-start gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30 fill-muted-foreground/10"}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{reviewCount.toLocaleString()} reviews</p>
          </div>

          <div className="space-y-2">
            {distribution.map(({ star, count, pct }) => (
              <button
                key={star}
                className="flex items-center gap-2 w-full group"
              >
                <span className="text-xs w-3 text-right text-muted-foreground">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6">{count}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary w-full justify-center mt-6"
          >
            Write a Review
          </button>
        </div>

        {/* Review list */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Customer Reviews</h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input py-2 text-sm w-auto min-w-[160px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Write review form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4 overflow-hidden"
              >
                <h3 className="font-semibold">Your Review</h3>

                {/* Star rating */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: s }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 transition-colors ${s <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    className="input"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Review *</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    placeholder="What did you like or dislike? How is the quality?"
                    rows={4}
                    required
                    minLength={10}
                    className="input resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{form.body.length}/2000</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline py-2.5 px-5 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center py-2.5">
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reviews */}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border pb-6 last:border-0 last:pb-0"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-background text-sm font-bold flex-shrink-0">
          {review.user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm">{review.user?.name || "Anonymous"}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                <Check className="w-2.5 h-2.5" /> Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {review.title && (
        <p className="font-semibold text-sm mb-2">{review.title}</p>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.body}</p>

      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
              <Image src={img} alt={`Review image ${i + 1}`} fill className="object-cover" sizes="64px" />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={markHelpful}
        disabled={voted}
        className={`flex items-center gap-1.5 text-xs transition-colors ${voted ? "text-brand-500" : "text-muted-foreground hover:text-foreground"}`}
      >
        <ThumbsUp className={`w-3.5 h-3.5 ${voted ? "fill-current" : ""}`} />
        Helpful ({helpful})
      </button>
    </motion.div>
  );
}
