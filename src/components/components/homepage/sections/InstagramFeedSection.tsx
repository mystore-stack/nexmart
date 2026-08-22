"use client";

import React from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";

interface InstagramFeedSectionProps {
  config: any;
}

export function InstagramFeedSection({ config }: InstagramFeedSectionProps) {
  const posts = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    image: config.images?.[i] || `https://via.placeholder.com/400x400/0D7A5E/ffffff?text=Instagram+${i + 1}`,
    likes: Math.floor(Math.random() * 1000) + 100,
    caption: config.captions?.[i] || "Luxury shopping at NexMart",
  }));

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Instagram className="w-8 h-8 text-pink-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {config.title || "@nexmart.morocco"}
            </h2>
          </div>
          <p className="text-gray-600">
            {config.subtitle || "Follow us for luxury inspiration and exclusive offers"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={config.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square group overflow-hidden rounded-xl"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
            </a>
          ))}
        </div>

        {config.showFollowButton && (
          <div className="text-center mt-8">
            <a
              href={config.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              Follow Us
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
