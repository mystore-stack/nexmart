"use client";

import React from "react";
import { Label } from "@/components/ui/shadcn-label";
import { Input } from "@/components/ui/shadcn-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PageSection } from "@prisma/client";

interface ContentTabProps {
  section: PageSection;
  onConfigUpdate: (updates: any) => void;
}

export function ContentTab({ section, onConfigUpdate }: ContentTabProps) {
  const config = section.config as any;

  return (
    <div className="space-y-6">
      {/* Hero Section Content */}
      {section.sectionType === "HERO" && (
        <HeroContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Product Section Content */}
      {section.sectionType === "FEATURED_PRODUCTS" && (
        <ProductContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Category Section Content */}
      {section.sectionType === "CATEGORIES" && (
        <CategoryContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Banner Section Content */}
      {section.sectionType === "PROMOTIONAL_BANNER" && (
        <BannerContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Flash Sale Section Content */}
      {section.sectionType === "FLASH_SALE" && (
        <FlashSaleContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Brand Section Content */}
      {section.sectionType === "BRANDS" && (
        <BrandContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Newsletter Section Content */}
      {section.sectionType === "NEWSLETTER" && (
        <NewsletterContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Campaigns Section Content */}
      {section.sectionType === "SPONSORED_PRODUCTS" && (
        <ProductContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {section.sectionType === "FLASH_DEALS" && (
        <FlashSaleContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {section.sectionType === "FREQUENTLY_BOUGHT_TOGETHER" && (
        <ProductContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {section.sectionType === "BUY_MORE_SAVE_MORE" && (
        <BuyMoreSaveMoreContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {section.sectionType === "MYSTERY_BOXES" && (
        <ProductContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {section.sectionType === "BUILD_YOUR_OWN_BUNDLE" && (
        <BuildYourOwnBundleContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}

      {/* Default Content */}
      {!["HERO", "FEATURED_PRODUCTS", "CATEGORIES", "PROMOTIONAL_BANNER", "FLASH_SALE", "BRANDS", "NEWSLETTER", "SPONSORED_PRODUCTS", "FLASH_DEALS", "FREQUENTLY_BOUGHT_TOGETHER", "BUY_MORE_SAVE_MORE", "MYSTERY_BOXES", "BUILD_YOUR_OWN_BUNDLE"].includes(section.sectionType as string) && (
        <DefaultContentEditor config={config} onConfigUpdate={onConfigUpdate} />
      )}
    </div>
  );
}

function HeroContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  const slides: any[] = config.content?.slides || [{ title: "", subtitle: "", description: "", cta: "", ctaLink: "" }];
  const [activeSlide, setActiveSlide] = React.useState(0);

  const updateSlide = (index: number, updates: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    onConfigUpdate({ content: { ...config.content, slides: newSlides } });
  };

  const addSlide = () => {
    const newSlides = [...slides, { title: "", subtitle: "", description: "", cta: "", ctaLink: "" }];
    onConfigUpdate({ content: { ...config.content, slides: newSlides } });
    setActiveSlide(newSlides.length - 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_: any, i: number) => i !== index);
      onConfigUpdate({ content: { ...config.content, slides: newSlides } });
      setActiveSlide(Math.max(0, index - 1));
    }
  };

  return (
    <div className="space-y-4">
      {/* Slides Navigation */}
      <div className="flex items-center gap-2">
        {slides.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeSlide === index ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Slide {index + 1}
          </button>
        ))}
        <button
          onClick={addSlide}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Active Slide Content */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Slide {activeSlide + 1}</h4>
          {slides.length > 1 && (
            <button
              onClick={() => removeSlide(activeSlide)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>

        <div>
          <Label>Title</Label>
          <Input
            value={slides[activeSlide]?.title || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlide(activeSlide, { title: e.target.value })}
            placeholder="Hero title"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Subtitle</Label>
          <Input
            value={slides[activeSlide]?.subtitle || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlide(activeSlide, { subtitle: e.target.value })}
            placeholder="Hero subtitle"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={slides[activeSlide]?.description || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSlide(activeSlide, { description: e.target.value })}
            placeholder="Hero description"
            rows={3}
            className="mt-2"
          />
        </div>

        <div>
          <Label>CTA Text</Label>
          <Input
            value={slides[activeSlide]?.cta || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlide(activeSlide, { cta: e.target.value })}
            placeholder="Button text"
            className="mt-2"
          />
        </div>

        <div>
          <Label>CTA Link</Label>
          <Input
            value={slides[activeSlide]?.ctaLink || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlide(activeSlide, { ctaLink: e.target.value })}
            placeholder="/shop"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

function ProductContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Section title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Section subtitle"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Product Source</Label>
        <Select
          value={config.productSource || "featured"}
          onValueChange={(value: string) => onConfigUpdate({ productSource: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured Products</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="new">New Arrivals</SelectItem>
            <SelectItem value="best_sellers">Best Sellers</SelectItem>
            <SelectItem value="manual">Manual Selection</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
            <SelectItem value="brand">By Brand</SelectItem>
            <SelectItem value="tag">By Tag</SelectItem>
            <SelectItem value="collection">By Collection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(config.productSource === "category" || config.productSource === "brand" || config.productSource === "tag" || config.productSource === "collection") && (
        <div>
          <Label>Filter Value</Label>
          <Input
            value={config.filterValue || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ filterValue: e.target.value })}
            placeholder="Category ID, Brand ID, etc."
            className="mt-2"
          />
        </div>
      )}

      <div>
        <Label>Sort By</Label>
        <Select
          value={config.sortBy || "newest"}
          onValueChange={(value: string) => onConfigUpdate({ sortBy: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="random">Random</SelectItem>
            <SelectItem value="name_asc">Name: A-Z</SelectItem>
            <SelectItem value="name_desc">Name: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Products per Page</Label>
        <Input
          type="number"
          value={config.limit || 8}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ limit: parseInt(e.target.value) })}
          min={1}
          max={24}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Display Type</Label>
        <Select
          value={config.displayType || "grid"}
          onValueChange={(value: string) => onConfigUpdate({ displayType: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select display" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="slider">Slider/Carousel</SelectItem>
            <SelectItem value="carousel_infinite">Infinite Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Columns (Desktop)</Label>
        <Select
          value={config.columnsDesktop || "4"}
          onValueChange={(value: string) => onConfigUpdate({ columnsDesktop: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
            <SelectItem value="5">5 Columns</SelectItem>
            <SelectItem value="6">6 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Columns (Tablet)</Label>
        <Select
          value={config.columnsTablet || "3"}
          onValueChange={(value: string) => onConfigUpdate({ columnsTablet: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Columns (Mobile)</Label>
        <Select
          value={config.columnsMobile || "2"}
          onValueChange={(value: string) => onConfigUpdate({ columnsMobile: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Column</SelectItem>
            <SelectItem value="2">2 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CategoryContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Section title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Section subtitle"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Layout</Label>
        <Select
          value={config.layout || "grid"}
          onValueChange={(value: string) => onConfigUpdate({ layout: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="slider">Slider</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="cards">Cards</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Columns (Desktop)</Label>
        <Select
          value={config.columnsDesktop || "4"}
          onValueChange={(value: string) => onConfigUpdate({ columnsDesktop: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
            <SelectItem value="5">5 Columns</SelectItem>
            <SelectItem value="6">6 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Columns (Tablet)</Label>
        <Select
          value={config.columnsTablet || "3"}
          onValueChange={(value: string) => onConfigUpdate({ columnsTablet: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Columns (Mobile)</Label>
        <Select
          value={config.columnsMobile || "2"}
          onValueChange={(value: string) => onConfigUpdate({ columnsMobile: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Column</SelectItem>
            <SelectItem value="2">2 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Image Ratio</Label>
        <Select
          value={config.imageRatio || "1:1"}
          onValueChange={(value: string) => onConfigUpdate({ imageRatio: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">Square (1:1)</SelectItem>
            <SelectItem value="4:3">Landscape (4:3)</SelectItem>
            <SelectItem value="16:9">Wide (16:9)</SelectItem>
            <SelectItem value="3:4">Portrait (3:4)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Hover Animation</Label>
        <Select
          value={config.hoverAnimation || "zoom"}
          onValueChange={(value: string) => onConfigUpdate({ hoverAnimation: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="slide">Slide</SelectItem>
            <SelectItem value="scale">Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showProductCount"
          checked={config.showProductCount !== false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ showProductCount: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="showProductCount" className="text-sm">Show Product Count</Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showDescription"
          checked={config.showDescription || false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ showDescription: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="showDescription" className="text-sm">Show Description</Label>
      </div>
    </div>
  );
}

function BannerContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Banner title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Banner subtitle"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={config.content?.description || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onConfigUpdate({ content: { ...config.content, description: e.target.value } })}
          placeholder="Banner description"
          rows={3}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Background Image</Label>
        <Input
          value={config.content?.backgroundImage || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, backgroundImage: e.target.value } })}
          placeholder="https://..."
          className="mt-2"
        />
      </div>
      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={config.content?.backgroundColor || "#ffffff"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, backgroundColor: e.target.value } })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Gradient</Label>
        <Select
          value={config.content?.gradient || "none"}
          onValueChange={(value: string) => onConfigUpdate({ content: { ...config.content, gradient: value } })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select gradient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Overlay Color</Label>
        <Input
          type="color"
          value={config.content?.overlayColor || "#000000"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, overlayColor: e.target.value } })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Overlay Opacity</Label>
        <Input
          type="range"
          min="0"
          max="100"
          value={config.content?.overlayOpacity || 50}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, overlayOpacity: parseInt(e.target.value) } })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Alignment</Label>
        <Select
          value={config.content?.alignment || "left"}
          onValueChange={(value: string) => onConfigUpdate({ content: { ...config.content, alignment: value } })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Height</Label>
        <Select
          value={config.content?.height || "400px"}
          onValueChange={(value: string) => onConfigUpdate({ content: { ...config.content, height: value } })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select height" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="300px">Small (300px)</SelectItem>
            <SelectItem value="400px">Medium (400px)</SelectItem>
            <SelectItem value="500px">Large (500px)</SelectItem>
            <SelectItem value="600px">Extra Large (600px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Border Radius</Label>
        <Input
          type="range"
          min="0"
          max="32"
          value={config.content?.borderRadius || 0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, borderRadius: parseInt(e.target.value) } })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Button Text</Label>
        <Input
          value={config.content?.cta || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, cta: e.target.value } })}
          placeholder="Button text"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Button Link</Label>
        <Input
          value={config.content?.ctaLink || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, ctaLink: e.target.value } })}
          placeholder="/shop"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Animation</Label>
        <Select
          value={config.content?.animation || "fade"}
          onValueChange={(value: string) => onConfigUpdate({ content: { ...config.content, animation: value } })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="slide">Slide</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="scale">Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function FlashSaleContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Flash Sale title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Flash Sale subtitle"
          className="mt-2"
        />
      </div>
      <div>
        <Label>End Date</Label>
        <Input
          type="datetime-local"
          value={config.content?.endDate || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, endDate: e.target.value } })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Product Source</Label>
        <Select
          value={config.productSource || "featured"}
          onValueChange={(value: string) => onConfigUpdate({ productSource: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured Products</SelectItem>
            <SelectItem value="manual">Manual Selection</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Products Limit</Label>
        <Input
          type="number"
          value={config.limit || 8}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ limit: parseInt(e.target.value) })}
          min={1}
          max={24}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Colors</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-xs">Primary</Label>
            <Input
              type="color"
              value={config.content?.primaryColor || "#ff0000"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, primaryColor: e.target.value } })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Secondary</Label>
            <Input
              type="color"
              value={config.content?.secondaryColor || "#ffffff"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, secondaryColor: e.target.value } })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showCountdown"
          checked={config.showCountdown !== false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ showCountdown: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="showCountdown" className="text-sm">Show Countdown Timer</Label>
      </div>
    </div>
  );
}

function BrandContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Brands title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Layout</Label>
        <Select
          value={config.layout || "grid"}
          onValueChange={(value: string) => onConfigUpdate({ layout: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="slider">Slider</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Columns</Label>
        <Select
          value={config.columns || "6"}
          onValueChange={(value: string) => onConfigUpdate({ columns: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
            <SelectItem value="5">5 Columns</SelectItem>
            <SelectItem value="6">6 Columns</SelectItem>
            <SelectItem value="8">8 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Logo Size</Label>
        <Select
          value={config.logoSize || "medium"}
          onValueChange={(value: string) => onConfigUpdate({ logoSize: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoplay"
          checked={config.autoplay || false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ autoplay: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="autoplay" className="text-sm">Autoplay</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="infinite"
          checked={config.infinite !== false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ infinite: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="infinite" className="text-sm">Infinite Loop</Label>
      </div>
    </div>
  );
}

function NewsletterContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Newsletter title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={config.content?.description || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onConfigUpdate({ content: { ...config.content, description: e.target.value } })}
          placeholder="Newsletter description"
          rows={3}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Input Placeholder</Label>
        <Input
          value={config.content?.inputPlaceholder || "Enter your email"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, inputPlaceholder: e.target.value } })}
          placeholder="Enter your email"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Button Text</Label>
        <Input
          value={config.content?.buttonText || "Subscribe"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, buttonText: e.target.value } })}
          placeholder="Subscribe"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Success Message</Label>
        <Input
          value={config.content?.successMessage || "Thank you for subscribing!"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, successMessage: e.target.value } })}
          placeholder="Thank you for subscribing!"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={config.content?.backgroundColor || "#000000"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, backgroundColor: e.target.value } })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Text Color</Label>
        <Input
          type="color"
          value={config.content?.textColor || "#ffffff"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, textColor: e.target.value } })}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function BuyMoreSaveMoreContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Buy More Save More title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Volume discounts"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Discount Tiers</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={config.content?.tiers?.[0]?.min || 2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const tiers = config.content?.tiers || [{ min: 2, discount: 10 }, { min: 3, discount: 15 }, { min: 5, discount: 20 }];
                tiers[0].min = parseInt(e.target.value);
                onConfigUpdate({ content: { ...config.content, tiers } });
              }}
              placeholder="Min items"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">items =</span>
            <Input
              type="number"
              value={config.content?.tiers?.[0]?.discount || 10}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const tiers = config.content?.tiers || [{ min: 2, discount: 10 }, { min: 3, discount: 15 }, { min: 5, discount: 20 }];
                tiers[0].discount = parseInt(e.target.value);
                onConfigUpdate({ content: { ...config.content, tiers } });
              }}
              placeholder="Discount %"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">% off</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={config.content?.tiers?.[1]?.min || 3}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const tiers = config.content?.tiers || [{ min: 2, discount: 10 }, { min: 3, discount: 15 }, { min: 5, discount: 20 }];
                tiers[1].min = parseInt(e.target.value);
                onConfigUpdate({ content: { ...config.content, tiers } });
              }}
              placeholder="Min items"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">items =</span>
            <Input
              type="number"
              value={config.content?.tiers?.[1]?.discount || 15}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const tiers = config.content?.tiers || [{ min: 2, discount: 10 }, { min: 3, discount: 15 }, { min: 5, discount: 20 }];
                tiers[1].discount = parseInt(e.target.value);
                onConfigUpdate({ content: { ...config.content, tiers } });
              }}
              placeholder="Discount %"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">% off</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={config.content?.tiers?.[2]?.min || 5}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const tiers = config.content?.tiers || [{ min: 2, discount: 10 }, { min: 3, discount: 15 }, { min: 5, discount: 20 }];
                tiers[2].min = parseInt(e.target.value);
                onConfigUpdate({ content: { ...config.content, tiers } });
              }}
              placeholder="Min items"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">items =</span>
            <Input
              type="number"
              value={config.content?.tiers?.[2]?.discount || 20}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const tiers = config.content?.tiers || [{ min: 2, discount: 10 }, { min: 3, discount: 15 }, { min: 5, discount: 20 }];
                tiers[2].discount = parseInt(e.target.value);
                onConfigUpdate({ content: { ...config.content, tiers } });
              }}
              placeholder="Discount %"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">% off</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildYourOwnBundleContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Build Your Own Bundle title"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Custom bundle builder"
          className="mt-2"
        />
      </div>
      <div>
        <Label>CTA Text</Label>
        <Input
          value={config.content?.ctaText || "Create Bundle"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, ctaText: e.target.value } })}
          placeholder="Create Bundle"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Minimum Items</Label>
        <Input
          type="number"
          value={config.content?.minItems || 2}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, minItems: parseInt(e.target.value) } })}
          min={2}
          max={6}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Bundle Discount (%)</Label>
        <Input
          type="number"
          value={config.content?.bundleDiscount || 15}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, bundleDiscount: parseInt(e.target.value) } })}
          min={5}
          max={50}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function DefaultContentEditor({ config, onConfigUpdate }: { config: any; onConfigUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={config.content?.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, title: e.target.value } })}
          placeholder="Section title"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={config.content?.subtitle || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({ content: { ...config.content, subtitle: e.target.value } })}
          placeholder="Section subtitle"
        />
      </div>
    </div>
  );
}
