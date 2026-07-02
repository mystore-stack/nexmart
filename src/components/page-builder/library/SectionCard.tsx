"use client";

import React, { useState } from "react";
import { 
  Layout, 
  Megaphone, 
  Mail, 
  ShoppingCart, 
  Star, 
  Minus, 
  Grid, 
  Building2, 
  Type, 
  Folder, 
  MessageSquare, 
  HelpCircle, 
  Video, 
  Image, 
  Flag, 
  Code, 
  ArrowRight, 
  CheckCircle, 
  Timer, 
  Grid3x3, 
  FileText, 
  Zap, 
  Heart, 
  Plus,
  Eye,
} from "lucide-react";
import type { SectionDefinition } from "./section-library";
import type { PageSection } from "../types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout,
  Megaphone,
  Mail,
  ShoppingCart,
  Star,
  Minus,
  Grid,
  Building2,
  Type,
  Folder,
  MessageSquare,
  HelpCircle,
  Video,
  Image,
  Flag,
  Code,
  ArrowRight,
  CheckCircle,
  Timer,
  Grid3x3,
  FileText,
  Zap,
};

interface SectionCardProps {
  section: SectionDefinition;
  onInsert: (sectionId: string) => void;
  onToggleFavorite: (sectionId: string) => void;
  isFavorite: boolean;
}

export const SectionCard = React.memo(function SectionCard({ section, onInsert, onToggleFavorite, isFavorite }: SectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = ICON_MAP[section.icon] || Layout;

  const handleInsert = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInsert(section.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInsert(section.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(section.id);
  };

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onClick={handleInsert}
      onKeyDown={handleKeyDown}
    >
      {/* Preview Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {section.previewImage ? (
          <img
            src={section.previewImage}
            alt={section.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <IconComponent className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {section.popular && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
              Popular
            </span>
          )}
          {section.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              New
            </span>
          )}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 transition-opacity duration-200">
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              aria-label={`Insert ${section.name} section`}
            >
              <Plus className="w-4 h-4" />
              Insert Section
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-label={isFavorite ? `Remove ${section.name} from favorites` : `Add ${section.name} to favorites`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <button
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                title="Preview"
                aria-label={`Preview ${section.name} section`}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">{section.name}</h3>
          </div>
          <button
            onClick={handleToggleFavorite}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{section.description}</p>

        <div className="flex flex-wrap gap-1">
          {section.categories.slice(0, 2).map((category) => (
            <span
              key={category}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {category}
            </span>
          ))}
          {section.categories.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{section.categories.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
