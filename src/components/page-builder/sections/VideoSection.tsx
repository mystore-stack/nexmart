import React from "react";
import { Play } from "lucide-react";
import type { SectionConfig, PageSection } from "../types";

interface VideoSectionProps {
  section: PageSection;
}

export function VideoSection({ section }: VideoSectionProps) {
  const config = section.config as SectionConfig & {
    videoUrl?: string;
    videoType?: "youtube" | "vimeo" | "direct";
    thumbnail?: string;
    caption?: string;
  };

  if (!config.videoUrl) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-500">
          No video URL configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            {config.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>
        )}

        <div className="relative rounded-lg overflow-hidden bg-gray-900">
          <div className="aspect-video">
            {config.videoType === "youtube" ? (
              <iframe
                src={config.videoUrl}
                title={config.title || "Video"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : config.videoType === "vimeo" ? (
              <iframe
                src={config.videoUrl}
                title={config.title || "Video"}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={config.videoUrl}
                controls
                className="w-full h-full"
                poster={config.thumbnail}
              />
            )}
          </div>
        </div>

        {config.caption && (
          <p className="text-center text-gray-600 mt-4">{config.caption}</p>
        )}
      </div>
    </div>
  );
}
