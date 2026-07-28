"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  avatar?: string;
  image?: string;
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: "review-1",
    author: "Fatima K.",
    rating: 5,
    comment: "Amazing quality! Got exactly what I expected. The packaging is beautiful and luxurious.",
    avatar: "👩",
    image: "https://images.unsplash.com/photo-1617638924702-92f37fc3371d?w=300",
  },
  {
    id: "review-2",
    author: "Ahmed B.",
    rating: 5,
    comment: "Incredible value for money. The mystery box contained items worth triple the price!",
    avatar: "👨",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300",
  },
  {
    id: "review-3",
    author: "Laila M.",
    rating: 4,
    comment: "Very happy with my purchase. Great experience from ordering to delivery.",
    avatar: "👩",
    image: "https://images.unsplash.com/photo-1609025661442-e8d6d7c71e60?w=300",
  },
];

interface CustomerReviewsSectionProps {
  reviews?: Review[];
}

export function CustomerReviewsSection({
  reviews = SAMPLE_REVIEWS,
}: CustomerReviewsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="px-4 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-bold text-neutral-900 mb-1">
          ⭐ Customer Reviews
        </h2>
        <p className="text-sm text-neutral-600 mb-4">
          See what our customers love
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3"
      >
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-xl bg-white border-2 border-neutral-100 p-4 hover:shadow-lg hover:border-amber-200 transition-all"
          >
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-amber-100/20 to-orange-100/20 -mr-10 -mt-10" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header with avatar and name */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">{review.avatar}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-neutral-900">
                    {review.author}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-neutral-300"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <div className="flex gap-2 mb-3">
                <Quote className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700 leading-relaxed">
                  "{review.comment}"
                </p>
              </div>

              {/* Unboxing image if available */}
              {review.image && (
                <div className="mt-3 rounded-lg overflow-hidden h-20 bg-neutral-100">
                  <img
                    src={review.image}
                    alt="Unboxing"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA to see more reviews */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full mt-4 py-2.5 border-2 border-neutral-300 rounded-xl font-semibold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
      >
        See All Reviews
      </motion.button>
    </motion.section>
  );
}
