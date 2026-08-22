"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          title,
          body,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTitle("");
        setBody("");
        setRating(0);
        onSuccess?.();
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Write a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-[#D4AF37] text-[#D4AF37]"
                      : "text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
            maxLength={120}
            className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Review</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={5}
            minLength={10}
            maxLength={2000}
            required
            className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
          />
          <p className="text-gray-400 text-sm mt-1">{body.length}/2000 characters</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0F172A] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </motion.div>
  );
}
