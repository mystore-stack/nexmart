"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Edit, Trash2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewListProps {
  productId: string;
  currentUserId?: string;
}

export default function ReviewList({ productId, currentUserId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&page=${page}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const handleHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: "POST" });
      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        )
      );
    } catch (error) {
      console.error("Failed to mark review as helpful:", error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (response.ok) {
        setReviews(reviews.filter((review) => review.id !== reviewId));
        setTotal(total - 1);
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-600"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-600 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-[#D4AF37]/20 text-center">
        <p className="text-gray-400">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-[#0F172A] font-bold text-lg">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{review.user.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  {review.verifiedPurchase && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUserId === review.user.id && (
                <>
                  <button
                    onClick={() => {/* TODO: Implement edit */}}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Edit review"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {review.title && (
            <h3 className="text-white font-semibold text-lg mb-2">{review.title}</h3>
          )}

          <p className="text-gray-300 mb-4">{review.body}</p>

          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => handleHelpful(review.id)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Helpful ({review.helpfulCount})</span>
            </button>
          </div>
        </motion.div>
      ))}

      {total > reviews.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0F172A] font-semibold rounded-lg transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
