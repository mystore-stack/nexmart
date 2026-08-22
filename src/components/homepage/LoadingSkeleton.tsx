"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  type?: "product" | "category" | "brand" | "testimonial" | "section";
  count?: number;
}

export function LoadingSkeleton({ type = "product", count = 4 }: LoadingSkeletonProps) {
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const shimmer = {
    hidden: { x: "-100%" },
    visible: {
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear",
      },
    },
  };

  const Shimmer = () => (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="visible"
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
    />
  );

  const ProductSkeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100/50">
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Shimmer />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded-2xl w-1/2 overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="h-6 bg-gray-200 rounded-2xl w-full overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="h-6 bg-gray-200 rounded-2xl w-3/4 overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 bg-gray-200 rounded-2xl w-1/3 overflow-hidden relative">
            <Shimmer />
          </div>
          <div className="h-6 bg-gray-200 rounded-2xl w-1/4 overflow-hidden relative">
            <Shimmer />
          </div>
        </div>
        <div className="h-12 bg-gray-200 rounded-2xl w-full overflow-hidden relative">
          <Shimmer />
        </div>
      </div>
    </div>
  );

  const CategorySkeleton = () => (
    <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <Shimmer />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="h-6 bg-white/50 rounded-2xl w-3/4 mb-2 overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="h-4 bg-white/50 rounded-2xl w-1/2 overflow-hidden relative">
          <Shimmer />
        </div>
      </div>
    </div>
  );

  const BrandSkeleton = () => (
    <div className="bg-white rounded-3xl p-8 flex items-center justify-center border border-gray-100/50">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden relative">
        <Shimmer />
      </div>
    </div>
  );

  const TestimonialSkeleton = () => (
    <div className="bg-white rounded-3xl p-8 border border-gray-100/50">
      <div className="flex items-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden relative">
            <Shimmer />
          </div>
        ))}
      </div>
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-gray-200 rounded-2xl w-full overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="h-4 bg-gray-200 rounded-2xl w-full overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="h-4 bg-gray-200 rounded-2xl w-3/4 overflow-hidden relative">
          <Shimmer />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden relative">
          <Shimmer />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-2xl w-32 overflow-hidden relative">
            <Shimmer />
          </div>
          <div className="h-4 bg-gray-200 rounded-2xl w-24 overflow-hidden relative">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  );

  const SectionSkeleton = () => (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mx-auto overflow-hidden relative">
        <Shimmer />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(count)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case "category":
        return <CategorySkeleton />;
      case "brand":
        return <BrandSkeleton />;
      case "testimonial":
        return <TestimonialSkeleton />;
      case "section":
        return <SectionSkeleton />;
      default:
        return <ProductSkeleton />;
    }
  };

  return (
    <motion.div
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${type === "section" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4"} gap-8`}
    >
      {type === "section" ? (
        <SectionSkeleton />
      ) : (
        [...Array(count)].map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            {renderSkeleton()}
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
