"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function RatingBreakdown({
  averageRating,
  totalReviews,
  ratingDistribution,
}: RatingBreakdownProps) {
  const getPercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "fill-[#D4AF37] text-[#D4AF37]"
            : i < rating
            ? "fill-[#D4AF37]/50 text-[#D4AF37]"
            : "text-gray-600"
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Rating Breakdown</h2>

      {/* Average Rating */}
      <div className="flex items-center gap-6 mb-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-[#D4AF37]">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mt-2">{renderStars(averageRating)}</div>
          <p className="text-gray-400 text-sm mt-2">{totalReviews} reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-white text-sm w-6">{star}</span>
              <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercentage(ratingDistribution[star as keyof typeof ratingDistribution])}%` }}
                  transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                  className="h-full bg-[#D4AF37] rounded-full"
                />
              </div>
              <span className="text-gray-400 text-sm w-10">
                {ratingDistribution[star as keyof typeof ratingDistribution]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-5 gap-4 text-center">
        {[
          { label: "Excellent", count: ratingDistribution[5] },
          { label: "Good", count: ratingDistribution[4] },
          { label: "Average", count: ratingDistribution[3] },
          { label: "Poor", count: ratingDistribution[2] },
          { label: "Bad", count: ratingDistribution[1] },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-3"
          >
            <p className="text-2xl font-bold text-[#D4AF37]">{item.count}</p>
            <p className="text-gray-400 text-xs mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
