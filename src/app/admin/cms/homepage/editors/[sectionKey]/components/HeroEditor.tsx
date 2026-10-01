"use client";

import React, { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Plus, Trash2, Settings, Monitor, Tablet, Smartphone, Layers, Image as ImageIcon, Type, Move, Copy, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, AlertCircle, CheckCircle2, Edit2 } from "lucide-react";

type HeroFrameConfig = {
  enabled: boolean;
  width?: string;
  height?: string;
  borderRadius?: string;
  shadow?: string;
  border?: "none" | "subtle" | "custom";
  customBorder?: string;
  overflow?: "hidden" | "visible";
  horizontalSpacing?: string;
  verticalSpacing?: string;
  desktop?: {
    enabled?: boolean;
  };
  tablet?: {
    enabled?: boolean;
  };
  mobile?: {
    enabled?: boolean;
  };
};

type HeroDimensions = {
  desktopWidth: string;
  desktopHeight: number;
  desktopMaxWidth: number;
  desktopAspectRatio: string;
  tabletWidth: string;
  tabletHeight: number;
  tabletMaxWidth: number;
  tabletAspectRatio: string;
  mobileWidth: string;
  mobileHeight: number;
  mobileMaxWidth: number;
  mobileAspectRatio: string;
  widthMode: "fullWidth" | "container" | "custom";
  imageFit: "cover" | "contain" | "fill";
  imagePosition: "custom" | "left" | "center" | "right" | "top" | "bottom";
  imagePositionX: string;
  imagePositionY: string;
  borderRadius: string;
  frame?: HeroFrameConfig;
};

type ResponsivePosition = {
  x: number;
  y: number;
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  perspective: number;
  shadow: number;
  opacity: number;
  
  // Premium art direction properties
  zIndex?: number;
  depthScale?: number;
  
  // Masking
  mask?: "none" | "soft-edge" | "gradient" | "custom";
  maskSoftness?: number;
  maskGradient?: string;
  
  // Blend mode
  blendMode?: "normal" | "multiply" | "screen" | "overlay" | "soft-light";
  
  // Lighting
  lightingIntensity?: number;
  lightingDirection?: number;
  lightingSoftness?: number;
  lightingAmbient?: number;
  lightingColorInfluence?: number;
  
  // Premium shadow
  shadowPreset?: "none" | "soft" | "natural" | "deep" | "floating" | "custom";
  shadowOpacity?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowX?: number;
  shadowY?: number;
  
  // Edge integration
  edgeSoftness?: number;
  edgeGlow?: number;
  edgeContrast?: number;
  edgeHighlight?: number;
};

type HeroLayer = {
  id: string;
  type: "image" | "text" | "decorative";
  name: string;
  visible: boolean;
  locked: boolean;
  
  // Image layer specific
  imageUrl?: string;
  imagePublicId?: string;
  imageWidth?: number;
  imageHeight?: number;
  displayMode?: "normal" | "3d-integrated" | "floating";
  
  // Text layer specific
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  ctaStyle?: "standard" | "integrated" | "3d" | "glass" | "minimal";
  ctaLink?: string;
  
  // Premium typography
  textOpacity?: number;
  textShadow?: string;
  textGlow?: number;
  textRotation?: number;
  textPerspective?: number;
  textTreatment?: "flat" | "editorial" | "integrated" | "3d";
  
  // CTA depth system
  ctaDepth?: number;
  ctaPerspective?: number;
  ctaShadow?: number;
  ctaGlow?: number;
  ctaOffset?: number;
  
  // 3D/Integrated effects
  desktop: ResponsivePosition;
  tablet: ResponsivePosition;
  mobile: ResponsivePosition;
};

type HeroSlide = {
  id: string;
  artwork: {
    imageUrl: string;
    imagePublicId: string;
    imageWidth: number;
    imageHeight: number;
  };
  layers: HeroLayer[];
  duration?: number; // seconds
  transition?: 'fade' | 'cinematic' | 'slide' | 'scale' | 'crossfade';
  enabled?: boolean;
};

type HeroComposition = {
  slides: HeroSlide[];
  autoplay?: boolean;
  slideDuration?: number; // default duration in seconds
  transition?: 'fade' | 'cinematic' | 'slide' | 'scale' | 'crossfade';
  pauseOnHover?: boolean;
};

// For backward compatibility: convert old single-slide format to new multi-slide format
function normalizeComposition(comp: any): HeroComposition {
  // If it's already in the new format with slides array
  if (comp && comp.slides && Array.isArray(comp.slides)) {
    return comp as HeroComposition;
  }
  
  // If it's in the old single-slide format, convert it
  if (comp && comp.artwork) {
    return {
      slides: [{
        id: `slide-${Date.now()}`,
        artwork: comp.artwork,
        layers: comp.layers || [],
        duration: 5,
        transition: 'cinematic',
        enabled: true,
      }],
      autoplay: true,
      slideDuration: 5,
      transition: 'cinematic',
      pauseOnHover: true,
    };
  }
  
  // Return empty composition
  return {
    slides: [],
    autoplay: true,
    slideDuration: 5,
    transition: 'cinematic',
    pauseOnHover: true,
  };
}

type SaveState = "saved" | "unsaved" | "saving" | "error";

const defaultFrameConfig: HeroFrameConfig = {
  enabled: true,
  width: "100%",
  height: "auto",
  borderRadius: "1.5rem",
  shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  border: "subtle",
  overflow: "hidden",
  horizontalSpacing: "1rem",
  verticalSpacing: "1rem",
  desktop: { enabled: true },
  tablet: { enabled: true },
  mobile: { enabled: false },
};

const defaultDimensions: HeroDimensions = {
  desktopWidth: "100%",
  desktopHeight: 420,
  desktopMaxWidth: 1440,
  desktopAspectRatio: "2.5/1",
  tabletWidth: "100%",
  tabletHeight: 320,
  tabletMaxWidth: 1024,
  tabletAspectRatio: "2.5/1",
  mobileWidth: "100%",
  mobileHeight: 280,
  mobileMaxWidth: 640,
  mobileAspectRatio: "2.5/1",
  widthMode: "fullWidth",
  imageFit: "cover",
  imagePosition: "center" as const,
  imagePositionX: "50%",
  imagePositionY: "50%",
  borderRadius: "0.5rem",
  frame: defaultFrameConfig,
};

const defaultResponsivePosition: ResponsivePosition = {
  x: 50,
  y: 50,
  scale: 100,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  perspective: 1000,
  shadow: 20,
  opacity: 100,
  
  // Premium art direction defaults
  zIndex: 10,
  depthScale: 100,
  mask: "none",
  maskSoftness: 50,
  maskGradient: "linear-gradient(to bottom, transparent, black)",
  blendMode: "normal",
  lightingIntensity: 0,
  lightingDirection: 135,
  lightingSoftness: 50,
  lightingAmbient: 100,
  lightingColorInfluence: 0,
  shadowPreset: "natural",
  shadowOpacity: 100,
  shadowBlur: 20,
  shadowSpread: 0,
  shadowX: 0,
  shadowY: 0,
  edgeSoftness: 0,
  edgeGlow: 0,
  edgeContrast: 100,
  edgeHighlight: 0,
};

const defaultComposition: HeroComposition = {
  slides: [],
  autoplay: true,
  slideDuration: 5,
  transition: 'cinematic',
  pauseOnHover: true,
};

// Composition presets
const compositionPresets = {
  "luxury-product": {
    name: "Luxury Product",
    description: "Premium product focus with elegant depth",
    recommendedLayers: [
      { type: "image", name: "Main Product", displayMode: "3d-integrated", zIndex: 20 },
      { type: "text", name: "CTA", ctaStyle: "integrated", zIndex: 30 },
    ],
  },
  "product-focus": {
    name: "Product Focus",
    description: "Centered product with minimal distraction",
    recommendedLayers: [
      { type: "image", name: "Product", displayMode: "3d-integrated", zIndex: 15 },
    ],
  },
  "editorial": {
    name: "Editorial",
    description: "Typography-driven layout with integrated elements",
    recommendedLayers: [
      { type: "text", name: "Main Title", textTreatment: "editorial", zIndex: 25 },
      { type: "image", name: "Accent Image", displayMode: "normal", zIndex: 10 },
    ],
  },
  "split-hero": {
    name: "Split Hero",
    description: "Classic split composition with art-directed balance",
    recommendedLayers: [
      { type: "image", name: "Product", zIndex: 20 },
      { type: "text", name: "Copy", textAlign: "left", zIndex: 25 },
    ],
  },
  "minimal": {
    name: "Minimal",
    description: "Clean, minimal composition with strategic elements",
    recommendedLayers: [
      { type: "text", name: "Brand", textTreatment: "flat", zIndex: 20 },
    ],
  },
};

// Validation functions
const validatePosition = (value: number, min: number, max: number): number => {
  const num = Number(value);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
};

const validateLayer = (layer: HeroLayer): HeroLayer => {
  const validated = { ...layer };
  
  // Validate responsive positions for all devices
  ['desktop', 'tablet', 'mobile'].forEach((device) => {
    const pos = validated[device as keyof typeof validated] as ResponsivePosition;
    pos.x = validatePosition(pos.x, 0, 100);
    pos.y = validatePosition(pos.y, 0, 100);
    pos.scale = validatePosition(pos.scale, 10, 200);
    pos.rotationX = validatePosition(pos.rotationX, -180, 180);
    pos.rotationY = validatePosition(pos.rotationY, -180, 180);
    pos.rotationZ = validatePosition(pos.rotationZ, -180, 180);
    pos.perspective = validatePosition(pos.perspective, 100, 2000);
    pos.shadow = validatePosition(pos.shadow, 0, 100);
    pos.opacity = validatePosition(pos.opacity, 0, 100);
  });
  
  // Validate text layer properties
  if (validated.type === 'text') {
    validated.fontSize = validatePosition(validated.fontSize || 24, 12, 72);
    validated.letterSpacing = validatePosition(validated.letterSpacing || 0, -2, 10);
  }
  
  return validated;
};

const validateComposition = (composition: HeroComposition): HeroComposition => {
  return {
    ...composition,
    slides: composition.slides.map(slide => ({
      ...slide,
      layers: slide.layers.map(validateLayer),
    })),
  };
};

// Deep comparison function for detecting unsaved changes
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

// Compare two compositions for equality
const compositionsEqual = (comp1: HeroComposition, comp2: HeroComposition): boolean => {
  return deepEqual(comp1, comp2);
};

export function HeroEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dimensions, setDimensions] = useState<HeroDimensions>(
    parsedConfig.dimensions ? { ...defaultDimensions, ...parsedConfig.dimensions } : defaultDimensions
  );
  
  const [frameConfig, setFrameConfig] = useState<HeroFrameConfig>(
    parsedConfig.dimensions?.frame ? { ...defaultFrameConfig, ...parsedConfig.dimensions.frame } : defaultFrameConfig
  );
  
  // Save state management
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedComposition, setSavedComposition] = useState<HeroComposition>(() => {
    // Initialize saved composition from parsed config with normalization
    const normalized = normalizeComposition(parsedConfig.composition);
    
    // Validate all layers in all slides
    const validatedSlides = normalized.slides.map(slide => ({
      ...slide,
      layers: (slide.layers || []).map(layer => ({
        ...layer,
        desktop: layer.desktop || { ...defaultResponsivePosition },
        tablet: layer.tablet || { ...defaultResponsivePosition, x: 68, y: 52, scale: 85 },
        mobile: layer.mobile || { ...defaultResponsivePosition, x: 50, y: 65, scale: 70 },
      })),
    }));
    
    return {
      ...normalized,
      slides: validatedSlides,
    };
  });
  
  // Add state for current slide being edited
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Helper to get current slide
  const getCurrentSlide = () => {
    return composition.slides[currentSlideIndex] || {
      id: `slide-${Date.now()}`,
      artwork: { imageUrl: '', imagePublicId: '', imageWidth: 0, imageHeight: 0 },
      layers: [],
      duration: 5,
      transition: 'cinematic',
      enabled: true,
    };
  };
  
  // Helper to update current slide
  const updateCurrentSlide = (updates: Partial<HeroSlide>) => {
    const updatedSlides = [...composition.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      ...updates,
    };
    setComposition({ ...composition, slides: updatedSlides });
  };
  
  // Helper to update current slide's layers
  const updateCurrentSlideLayers = (updater: (layers: HeroLayer[]) => HeroLayer[]) => {
    const updatedSlides = [...composition.slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      layers: updater(currentSlide.layers || []),
    };
    setComposition({ ...composition, slides: updatedSlides });
  };
  
  // Helper to get current slide's layers
  const getCurrentLayers = () => {
    return composition.slides[currentSlideIndex]?.layers || [];
  };
  
  // Helper to get current slide's artwork
  const getCurrentArtwork = () => {
    return composition.slides[currentSlideIndex]?.artwork || { imageUrl: '', imagePublicId: '', imageWidth: 0, imageHeight: 0 };
  };
  
  // Slide management functions
  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      artwork: { imageUrl: '', imagePublicId: '', imageWidth: 0, imageHeight: 0 },
      layers: [],
      duration: composition.slideDuration || 5,
      transition: composition.transition || 'cinematic',
      enabled: true,
    };
    setComposition({
      ...composition,
      slides: [...composition.slides, newSlide],
    });
    setCurrentSlideIndex(composition.slides.length);
  };
  
  const deleteSlide = (index: number) => {
    if (composition.slides.length <= 1) return;
    const updatedSlides = composition.slides.filter((_, i) => i !== index);
    setComposition({ ...composition, slides: updatedSlides });
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
    }
  };
  
  const duplicateSlide = (index: number) => {
    const slideToDuplicate = composition.slides[index];
    const newSlide: HeroSlide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      layers: slideToDuplicate.layers.map(layer => ({
        ...layer,
        id: `${layer.id}-copy-${Date.now()}`,
        name: `${layer.name} (copy)`,
      })),
    };
    const updatedSlides = [...composition.slides];
    updatedSlides.splice(index + 1, 0, newSlide);
    setComposition({ ...composition, slides: updatedSlides });
    setCurrentSlideIndex(index + 1);
  };
  
  const moveSlide = (fromIndex: number, toIndex: number) => {
    const updatedSlides = [...composition.slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    setComposition({ ...composition, slides: updatedSlides });
    if (currentSlideIndex === fromIndex) {
      setCurrentSlideIndex(toIndex);
    } else if (fromIndex < currentSlideIndex && toIndex >= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else if (fromIndex > currentSlideIndex && toIndex <= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const toggleSlideEnabled = (index: number) => {
    const updatedSlides = [...composition.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      enabled: !updatedSlides[index].enabled,
    };
    setComposition({ ...composition, slides: updatedSlides });
  };
  
  const [composition, setComposition] = useState<HeroComposition>(() => {
    // Backwards compatibility: handle existing hero configurations
    const normalized = normalizeComposition(parsedConfig.composition);
    console.log("[HERO EDITOR] Loading existing composition:", normalized);
    
    // Validate all layers in all slides
    const validatedSlides = normalized.slides.map(slide => ({
      ...slide,
      layers: (slide.layers || []).map(layer => ({
        ...layer,
        desktop: layer.desktop || { ...defaultResponsivePosition },
        tablet: layer.tablet || { ...defaultResponsivePosition, x: 68, y: 52, scale: 85 },
        mobile: layer.mobile || { ...defaultResponsivePosition, x: 50, y: 65, scale: 70 },
      })),
    }));
    
    const result = {
      ...normalized,
      slides: validatedSlides,
    };
    console.log("[HERO EDITOR] Composition loaded and validated:", result);
    return result;
  });
  
  // Reset confirmation dialog state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Art direction panel state
  const [showArtDirection, setShowArtDirection] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showComposition, setShowComposition] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function fetchHeroConfig() {
      try {
        const response = await fetch("/api/hero/config");
        const data = await response.json();
        if (data.success && data.data) {
          setDimensions({ ...defaultDimensions, ...data.data } as HeroDimensions);
        }
      } catch (error) {
        console.error("Failed to fetch hero config:", error);
      }
    }
    fetchHeroConfig();
  }, []);

  // Debug: Monitor composition changes
  useEffect(() => {
    const currentSlide = composition.slides[currentSlideIndex];
    console.log("[HERO EDITOR] Composition state changed:", {
      slidesCount: composition.slides.length,
      currentSlideIndex,
      hasArtwork: !!currentSlide?.artwork.imageUrl,
      artworkUrl: currentSlide?.artwork.imageUrl,
      layersCount: currentSlide?.layers.length || 0,
      layers: currentSlide?.layers.map(l => ({
        id: l.id,
        type: l.type,
        name: l.name,
        visible: l.visible,
        hasImage: !!l.imageUrl,
      })),
    });
  }, [composition]);

  // Detect unsaved changes
  useEffect(() => {
    if (saveState === "saving") return; // Don't update state while saving
    
    const hasUnsavedChanges = !compositionsEqual(composition, savedComposition);
    
    if (hasUnsavedChanges && saveState !== "unsaved" && saveState !== "error") {
      setSaveState("unsaved");
    } else if (!hasUnsavedChanges && saveState === "unsaved") {
      setSaveState("saved");
    }
  }, [composition, savedComposition, saveState]);

  // Navigation protection for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  const handleSave = () => {
    if (saveState === "saving") return; // Prevent duplicate saves
    
    setSaveState("saving");
    setSaveError(null);
    
    startTransition(async () => {
      try {
        // Validate composition before saving
        const validatedComposition = validateComposition(composition);
        
        const result = await updateSectionConfig(section.id, { 
          ...parsedConfig, 
          dimensions: { 
            ...dimensions, 
            frame: frameConfig 
          },
          composition: validatedComposition 
        });
        
        if (result.success) {
          setSavedComposition(JSON.parse(JSON.stringify(validatedComposition)));
          setSaveState("saved");
          router.refresh();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSaveState("saved");
          }, 3000);
        } else {
          setSaveState("error");
          setSaveError("Unable to save composition");
        }
      } catch (error) {
        console.error("[HERO EDITOR] Save failed:", error);
        setSaveState("error");
        setSaveError("Unable to save composition. Please try again.");
      }
    });
  };

  const handleSaveComposition = () => {
    handleSave();
  };

  const handleReset = () => {
    if (saveState !== "unsaved") return; // Nothing to reset
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setComposition(JSON.parse(JSON.stringify(savedComposition)));
    setSaveState("saved");
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  // Layer management functions
  const addImageLayer = () => {
    const newLayer: HeroLayer = {
      id: Date.now().toString(),
      type: "image",
      name: "Product Image",
      visible: true,
      locked: false,
      imageUrl: "",
      displayMode: "3d-integrated",
      desktop: { ...defaultResponsivePosition },
      tablet: { ...defaultResponsivePosition, x: 68, y: 52, scale: 85 },
      mobile: { ...defaultResponsivePosition, x: 50, y: 65, scale: 70 },
    };
    updateCurrentSlideLayers(layers => [...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const addTextLayer = () => {
    const newLayer: HeroLayer = {
      id: Date.now().toString(),
      type: "text",
      name: "CTA Text",
      visible: true,
      locked: false,
      text: "Découvrir",
      fontSize: 24,
      fontWeight: "600",
      letterSpacing: 0,
      lineHeight: 1.2,
      textColor: "#ffffff",
      textAlign: "center",
      ctaStyle: "integrated",
      ctaLink: "",
      
      // Premium typography defaults
      textOpacity: 100,
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
      textGlow: 0,
      textRotation: 0,
      textPerspective: 1000,
      textTreatment: "integrated",
      
      // CTA depth defaults
      ctaDepth: 0,
      ctaPerspective: 1000,
      ctaShadow: 20,
      ctaGlow: 0,
      ctaOffset: 0,
      
      desktop: { ...defaultResponsivePosition, x: 50, y: 70 },
      tablet: { ...defaultResponsivePosition, x: 50, y: 72, scale: 90 },
      mobile: { ...defaultResponsivePosition, x: 50, y: 75, scale: 80 },
    };
    updateCurrentSlideLayers(layers => [...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (layerId: string, updates: Partial<HeroLayer>) => {
    updateCurrentSlideLayers(layers => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          const validatedUpdates = { ...updates };
          
          // Validate text-specific properties
          if (validatedUpdates.fontSize !== undefined) {
            validatedUpdates.fontSize = validatePosition(validatedUpdates.fontSize, 12, 72);
          }
          if (validatedUpdates.letterSpacing !== undefined) {
            validatedUpdates.letterSpacing = validatePosition(validatedUpdates.letterSpacing, -2, 10);
          }
          
          // Validate text content
          if (validatedUpdates.text !== undefined) {
            const text = String(validatedUpdates.text).trim();
            validatedUpdates.text = text.substring(0, 100); // Max 100 characters
          }
          
          // Validate image URL
          if (validatedUpdates.imageUrl !== undefined) {
            const url = String(validatedUpdates.imageUrl).trim();
            if (url === '') {
              validatedUpdates.imageUrl = '';
            } else if (!url.startsWith('http')) {
              // Invalid URL, don't update
              delete validatedUpdates.imageUrl;
            }
          }
          
          // Validate CTA link
          if (validatedUpdates.ctaLink !== undefined) {
            const link = String(validatedUpdates.ctaLink).trim();
            if (link === '') {
              validatedUpdates.ctaLink = '';
            } else if (!link.startsWith('/')) {
              // Invalid link, don't update
              delete validatedUpdates.ctaLink;
            } else {
              // Validate link format (basic check)
              validatedUpdates.ctaLink = link.substring(0, 500); // Max 500 characters
            }
          }
          
          return { ...layer, ...validatedUpdates };
        }
        return layer;
      });
      
      return updatedLayers;
    });
  };

  const updateLayerPosition = (layerId: string, device: "desktop" | "tablet" | "mobile", updates: Partial<ResponsivePosition>) => {
    updateCurrentSlideLayers(layers => {
      const updatedLayers = layers.map(layer => {
        if (layer.id === layerId) {
          const currentPosition = layer[device];
          const validatedUpdates = { ...updates };
          
          // Validate each updated property
          if (validatedUpdates.x !== undefined) {
            validatedUpdates.x = validatePosition(validatedUpdates.x, 0, 100);
          }
          if (validatedUpdates.y !== undefined) {
            validatedUpdates.y = validatePosition(validatedUpdates.y, 0, 100);
          }
          if (validatedUpdates.scale !== undefined) {
            validatedUpdates.scale = validatePosition(validatedUpdates.scale, 10, 200);
          }
          if (validatedUpdates.rotationX !== undefined) {
            validatedUpdates.rotationX = validatePosition(validatedUpdates.rotationX, -180, 180);
          }
          if (validatedUpdates.rotationY !== undefined) {
            validatedUpdates.rotationY = validatePosition(validatedUpdates.rotationY, -180, 180);
          }
          if (validatedUpdates.rotationZ !== undefined) {
            validatedUpdates.rotationZ = validatePosition(validatedUpdates.rotationZ, -180, 180);
          }
          if (validatedUpdates.perspective !== undefined) {
            validatedUpdates.perspective = validatePosition(validatedUpdates.perspective, 100, 2000);
          }
          if (validatedUpdates.shadow !== undefined) {
            validatedUpdates.shadow = validatePosition(validatedUpdates.shadow, 0, 100);
          }
          if (validatedUpdates.opacity !== undefined) {
            validatedUpdates.opacity = validatePosition(validatedUpdates.opacity, 0, 100);
          }
          
          return { ...layer, [device]: { ...currentPosition, ...validatedUpdates } };
        }
        return layer;
      });
      
      return updatedLayers;
    });
  };

  const deleteLayer = (layerId: string) => {
    updateCurrentSlideLayers(layers => layers.filter(layer => layer.id !== layerId));
    if (selectedLayerId === layerId) setSelectedLayerId(null);
  };

  const duplicateLayer = (layerId: string) => {
    const layer = getCurrentLayers().find(l => l.id === layerId);
    if (layer) {
      const newLayer = {
        ...layer,
        id: Date.now().toString(),
        name: `${layer.name} (copy)`,
      };
      updateCurrentSlideLayers(layers => [...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
    }
  };

  const moveLayer = (fromIndex: number, toIndex: number) => {
    const updatedSlides = [...composition.slides];
    const newLayers = [...updatedSlides[currentSlideIndex].layers];
    const [movedLayer] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, movedLayer);
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      layers: newLayers,
    };
    setComposition({ ...composition, slides: updatedSlides });
  };

  const toggleLayerVisibility = (layerId: string) => {
    const updatedSlides = [...composition.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      layers: updatedSlides[currentSlideIndex].layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      ),
    };
    setComposition({ ...composition, slides: updatedSlides });
  };

  const handleArtworkUpload = async (file: File) => {
    console.log("[HERO EDITOR] Starting artwork upload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "nexmart/hero-banners");

      console.log("[HERO EDITOR] Sending upload request to /api/upload");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("[HERO EDITOR] Upload response status:", response.status);
      const result = await response.json();
      console.log("[HERO EDITOR] Upload response data:", result);
      
      if (result.success) {
        console.log("[HERO EDITOR] Upload successful, updating composition");
        
        // Handle both response formats: { success: true, url: ... } or { success: true, data: { url: ... } }
        const uploadData = result.data || result;
        const imageUrl = uploadData.url;
        const publicId = uploadData.publicId;
        const width = uploadData.width;
        const height = uploadData.height;
        
        console.log("[HERO EDITOR] Extracted upload data:", { imageUrl, publicId, width, height });
        
        // Update current slide's artwork
        const updatedSlides = [...composition.slides];
        updatedSlides[currentSlideIndex] = {
          ...updatedSlides[currentSlideIndex],
          artwork: {
            imageUrl: imageUrl || '',
            imagePublicId: publicId || '',
            imageWidth: width || 0,
            imageHeight: height || 0,
          },
        };
        
        setComposition({
          ...composition,
          slides: updatedSlides,
        });
        console.log("[HERO EDITOR] Composition updated with new artwork");
      } else {
        console.error("[HERO EDITOR] Upload failed:", result.error);
        alert("Failed to upload image: " + result.error);
      }
    } catch (error) {
      console.error("[HERO EDITOR] Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLayerImageUpload = async (layerId: string, file: File) => {
    console.log("[HERO EDITOR] Starting layer image upload:", {
      layerId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "nexmart/hero-layers");

      console.log("[HERO EDITOR] Sending layer upload request to /api/upload");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("[HERO EDITOR] Layer upload response status:", response.status);
      const result = await response.json();
      console.log("[HERO EDITOR] Layer upload response data:", result);
      
      if (result.success) {
        console.log("[HERO EDITOR] Layer upload successful, updating layer:", layerId);
        
        // Handle both response formats: { success: true, url: ... } or { success: true, data: { url: ... } }
        const uploadData = result.data || result;
        const imageUrl = uploadData.url;
        const publicId = uploadData.publicId;
        const width = uploadData.width;
        const height = uploadData.height;
        
        console.log("[HERO EDITOR] Extracted layer upload data:", { imageUrl, publicId, width, height });
        
        updateLayer(layerId, {
          imageUrl: imageUrl || '',
          imagePublicId: publicId || '',
          imageWidth: width,
          imageHeight: height,
        });
        console.log("[HERO EDITOR] Layer updated with new image");
      } else {
        console.error("[HERO EDITOR] Layer upload failed:", result.error);
        alert("Failed to upload image: " + result.error);
      }
    } catch (error) {
      console.error("[HERO EDITOR] Layer upload error:", error);
      alert("Failed to upload image");
    }
  };

  const saveDimensions = async () => {
    try {
      const { updateHeroDimensions } = await import("@/lib/cms/actions");
      const result = await updateHeroDimensions(dimensions);
      if (result.success) {
        alert("Dimensions saved successfully!");
        router.refresh();
      } else {
        alert("Failed to save dimensions: " + result.error);
      }
    } catch (error) {
      console.error("Failed to save dimensions:", error);
      alert("Failed to save dimensions");
    }
  };

  const resetDimensions = async () => {
    try {
      const { resetHeroDimensions } = await import("@/lib/cms/actions");
      const result = await resetHeroDimensions();
      if (result.success) {
        setDimensions(result.data as HeroDimensions);
        alert("Dimensions reset to recommended values!");
      } else {
        alert("Failed to reset dimensions: " + result.error);
      }
    } catch (error) {
      console.error("Failed to reset dimensions:", error);
      alert("Failed to reset dimensions");
    }
  };

  const updateDimension = (key: keyof HeroDimensions, value: any) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  };

  const updateFrameConfig = (key: keyof HeroFrameConfig, value: any) => {
    const newFrameConfig = { ...frameConfig, [key]: value };
    setFrameConfig(newFrameConfig);
    setDimensions(prev => ({ ...prev, frame: newFrameConfig }));
  };

  const updateFrameDeviceConfig = (device: 'desktop' | 'tablet' | 'mobile', key: string, value: any) => {
    const newFrameConfig = {
      ...frameConfig,
      [device]: {
        ...(frameConfig[device] || {}),
        [key]: value
      }
    };
    setFrameConfig(newFrameConfig);
    setDimensions(prev => ({ ...prev, frame: newFrameConfig }));
  };

  const getPreviewStyle = () => {
    const deviceConfig = previewDevice === "mobile" ? {
      width: dimensions.mobileWidth,
      height: dimensions.mobileHeight,
      aspectRatio: dimensions.mobileAspectRatio,
      maxWidth: dimensions.mobileMaxWidth,
    } : previewDevice === "tablet" ? {
      width: dimensions.tabletWidth,
      height: dimensions.tabletHeight,
      aspectRatio: dimensions.tabletAspectRatio,
      maxWidth: dimensions.tabletMaxWidth,
    } : {
      width: dimensions.desktopWidth,
      height: dimensions.desktopHeight,
      aspectRatio: dimensions.desktopAspectRatio,
      maxWidth: dimensions.desktopMaxWidth,
    };

    // Get frame config from dimensions.frame
    const currentFrameConfig = dimensions.frame || frameConfig;

    // Check if frame is enabled for current device
    const isFrameEnabled = currentFrameConfig.enabled && (
      previewDevice === "desktop" ? (currentFrameConfig.desktop?.enabled ?? true) :
      previewDevice === "tablet" ? (currentFrameConfig.tablet?.enabled ?? true) :
      (currentFrameConfig.mobile?.enabled ?? false)
    );

    const baseStyle = {
      width: deviceConfig.width || "100%",
      aspectRatio: deviceConfig.aspectRatio || "2.5/1",
      minHeight: `${deviceConfig.height || 280}px`,
      maxHeight: `${deviceConfig.maxWidth || 640}px`,
      borderRadius: dimensions.borderRadius || "0.5rem",
    };

    // Apply frame styles if enabled
    if (isFrameEnabled) {
      return {
        ...baseStyle,
        borderRadius: currentFrameConfig.borderRadius || "1.5rem",
        boxShadow: currentFrameConfig.shadow || "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: currentFrameConfig.overflow || "hidden",
        border: currentFrameConfig.border === "subtle" ? "1px solid rgba(255,255,255,0.1)" :
               currentFrameConfig.border === "custom" ? currentFrameConfig.customBorder || "none" :
               "none",
      };
    }

    return baseStyle;
  };

  const selectedLayer = getCurrentLayers().find(l => l.id === selectedLayerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Hero Configuration</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowArtDirection(!showArtDirection)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" /> {showArtDirection ? "Hide Art Direction" : "Art Direction"}
          </button>
          <button 
            onClick={() => setShowComposition(!showComposition)}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
          >
            <Layers className="w-4 h-4" /> {showComposition ? "Hide Composition" : "Show Composition"}
          </button>
          <button 
            onClick={() => setShowDimensions(!showDimensions)}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
          >
            <Settings className="w-4 h-4" /> {showDimensions ? "Hide Dimensions" : "Show Dimensions"}
          </button>
        </div>
      </div>

      {/* Dimensions Panel */}
      {showDimensions && (
        <div className="border rounded-xl p-4 bg-card space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h4 className="text-lg font-semibold">Hero Dimensions</h4>
            <div className="flex gap-2">
              <button 
                onClick={resetDimensions}
                className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-secondary"
              >
                Reset to Default
              </button>
              <button 
                onClick={saveDimensions}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-700 text-white rounded-lg hover:bg-brand-800"
              >
                Save Dimensions
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Device Controls */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "mobile" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="w-4 h-4" /> Mobile
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "tablet" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                  onClick={() => setPreviewDevice("tablet")}
                >
                  <Tablet className="w-4 h-4" /> Tablet
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "desktop" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="w-4 h-4" /> Desktop
                </button>
              </div>

              {/* Mobile Settings */}
              {previewDevice === "mobile" && (
                <div className="space-y-3">
                  <h5 className="font-medium">Mobile Settings</h5>
                  <div>
                    <label className="block text-sm mb-1">Height (px) - Range: 150-500</label>
                    <input 
                      type="number"
                      value={dimensions.mobileHeight || 280}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 150 && value <= 500) {
                          updateDimension("mobileHeight", value);
                        }
                      }}
                      className="w-full border rounded-lg p-2"
                      min={150}
                      max={500}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Max Width (px)</label>
                    <input 
                      type="number"
                      value={dimensions.mobileMaxWidth || 640}
                      onChange={(e) => updateDimension("mobileMaxWidth", parseInt(e.target.value))}
                      className="w-full border rounded-lg p-2"
                      min={320}
                      max={1920}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Aspect Ratio</label>
                    <select 
                      value={dimensions.mobileAspectRatio || "2.5/1"}
                      onChange={(e) => updateDimension("mobileAspectRatio", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="auto">Auto</option>
                      <option value="16/9">16:9</option>
                      <option value="2:1">2:1</option>
                      <option value="2.5/1">2.5:1</option>
                      <option value="3:1">3:1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Width Mode</label>
                    <select 
                      value={dimensions.widthMode || "fullWidth"}
                      onChange={(e) => updateDimension("widthMode", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="fullWidth">Full Width</option>
                      <option value="container">Container</option>
                      <option value="custom">Custom Width</option>
                    </select>
                  </div>
                  {dimensions.widthMode === "custom" && (
                    <div>
                      <label className="block text-sm mb-1">Custom Width (%) - Range: 50-100</label>
                      <input 
                        type="number"
                        value={parseInt(dimensions.mobileWidth || "100")}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 50 && value <= 100) {
                            updateDimension("mobileWidth", `${value}%`);
                          }
                        }}
                        className="w-full border rounded-lg p-2"
                        min={50}
                        max={100}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tablet Settings */}
              {previewDevice === "tablet" && (
                <div className="space-y-3">
                  <h5 className="font-medium">Tablet Settings</h5>
                  <div>
                    <label className="block text-sm mb-1">Height (px) - Range: 200-600</label>
                    <input 
                      type="number"
                      value={dimensions.tabletHeight || 320}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 200 && value <= 600) {
                          updateDimension("tabletHeight", value);
                        }
                      }}
                      className="w-full border rounded-lg p-2"
                      min={200}
                      max={600}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Max Width (px)</label>
                    <input 
                      type="number"
                      value={dimensions.tabletMaxWidth || 1024}
                      onChange={(e) => updateDimension("tabletMaxWidth", parseInt(e.target.value))}
                      className="w-full border rounded-lg p-2"
                      min={480}
                      max={1920}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Aspect Ratio</label>
                    <select 
                      value={dimensions.tabletAspectRatio || "2.5/1"}
                      onChange={(e) => updateDimension("tabletAspectRatio", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="auto">Auto</option>
                      <option value="16/9">16:9</option>
                      <option value="2:1">2:1</option>
                      <option value="2.5/1">2.5:1</option>
                      <option value="3:1">3:1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Width Mode</label>
                    <select 
                      value={dimensions.widthMode || "fullWidth"}
                      onChange={(e) => updateDimension("widthMode", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="fullWidth">Full Width</option>
                      <option value="container">Container</option>
                      <option value="custom">Custom Width</option>
                    </select>
                  </div>
                  {dimensions.widthMode === "custom" && (
                    <div>
                      <label className="block text-sm mb-1">Custom Width (%) - Range: 50-100</label>
                      <input 
                        type="number"
                        value={parseInt(dimensions.tabletWidth || "100")}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 50 && value <= 100) {
                            updateDimension("tabletWidth", `${value}%`);
                          }
                        }}
                        className="w-full border rounded-lg p-2"
                        min={50}
                        max={100}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Desktop Settings */}
              {previewDevice === "desktop" && (
                <div className="space-y-3">
                  <h5 className="font-medium">Desktop Settings</h5>
                  <div>
                    <label className="block text-sm mb-1">Height (px) - Range: 300-800</label>
                    <input 
                      type="number"
                      value={dimensions.desktopHeight || 420}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 300 && value <= 800) {
                          updateDimension("desktopHeight", value);
                        }
                      }}
                      className="w-full border rounded-lg p-2"
                      min={300}
                      max={800}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Max Width (px)</label>
                    <input 
                      type="number"
                      value={dimensions.desktopMaxWidth || 1440}
                      onChange={(e) => updateDimension("desktopMaxWidth", parseInt(e.target.value))}
                      className="w-full border rounded-lg p-2"
                      min={1024}
                      max={2560}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Aspect Ratio</label>
                    <select 
                      value={dimensions.desktopAspectRatio || "2.5/1"}
                      onChange={(e) => updateDimension("desktopAspectRatio", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="auto">Auto</option>
                      <option value="16/9">16:9</option>
                      <option value="2:1">2:1</option>
                      <option value="2.5/1">2.5:1</option>
                      <option value="3:1">3:1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Width Mode</label>
                    <select 
                      value={dimensions.widthMode || "fullWidth"}
                      onChange={(e) => updateDimension("widthMode", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="fullWidth">Full Width</option>
                      <option value="container">Container</option>
                      <option value="custom">Custom Width</option>
                    </select>
                  </div>
                  {dimensions.widthMode === "custom" && (
                    <div>
                      <label className="block text-sm mb-1">Custom Width (%) - Range: 50-100</label>
                      <input 
                        type="number"
                        value={parseInt(dimensions.desktopWidth || "100")}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 50 && value <= 100) {
                            updateDimension("desktopWidth", `${value}%`);
                          }
                        }}
                        className="w-full border rounded-lg p-2"
                        min={50}
                        max={100}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="space-y-4">
              <h5 className="font-medium">Live Preview</h5>
              <div className="border rounded-lg p-4 bg-gray-100">
                <div
                  className="bg-gradient-to-r from-[#0d1f1c] to-[#0a1815] relative overflow-hidden"
                  style={getPreviewStyle()}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-sm opacity-70">Hero Preview</p>
                      <p className="text-xs opacity-50 mt-1">
                        {previewDevice}: {dimensions[`${previewDevice}Height` as keyof HeroDimensions]}px height
                      </p>
                      <p className="text-xs opacity-50 mt-1">
                        Frame: {(() => {
                          const currentFrameConfig = dimensions.frame || frameConfig;
                          if (!currentFrameConfig.enabled) return "Disabled";
                          const deviceEnabled = 
                            previewDevice === "desktop" ? (currentFrameConfig.desktop?.enabled ?? true) :
                            previewDevice === "tablet" ? (currentFrameConfig.tablet?.enabled ?? true) :
                            (currentFrameConfig.mobile?.enabled ?? false);
                          return deviceEnabled ? "Enabled" : "Disabled";
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Device:</span>
                  <span className="font-medium capitalize">{previewDevice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <span className="font-medium">{dimensions[`${previewDevice}Height` as keyof HeroDimensions]}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aspect Ratio:</span>
                  <span className="font-medium">{dimensions[`${previewDevice}AspectRatio` as keyof HeroDimensions]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frame Status:</span>
                  <span className="font-medium">
                    {(() => {
                      const currentFrameConfig = dimensions.frame || frameConfig;
                      if (!currentFrameConfig.enabled) return "Disabled";
                      const deviceEnabled = 
                        previewDevice === "desktop" ? (currentFrameConfig.desktop?.enabled ?? true) :
                        previewDevice === "tablet" ? (currentFrameConfig.tablet?.enabled ?? true) :
                        (currentFrameConfig.mobile?.enabled ?? false);
                      return deviceEnabled ? "Enabled" : "Disabled";
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Settings */}
          <div className="border-t pt-4 space-y-4">
            <h5 className="font-medium">Global Settings</h5>
            
            {/* Hero Frame Control */}
            <div className="space-y-4 border-b pb-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Hero Frame</h5>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateFrameConfig('enabled', !frameConfig.enabled)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      frameConfig.enabled 
                        ? 'bg-brand-700 text-white' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {frameConfig.enabled ? '● Enabled' : '○ Disabled'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {frameConfig.enabled 
                  ? 'Hero will be displayed inside a contained frame/cadre' 
                  : 'Hero will be displayed as full-width without a frame'}
              </p>

              {/* Advanced Frame Settings */}
              {frameConfig.enabled && (
                <div className="space-y-4 pt-4">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-sm font-medium">Advanced Frame Settings</span>
                      <span className="transition group-open:rotate-180">
                        <ChevronUp className="w-4 h-4" />
                      </span>
                    </summary>
                    <div className="mt-4 space-y-4">
                      {/* Responsive Frame Settings */}
                      <div className="space-y-3">
                        <h6 className="text-sm font-medium">Responsive Frame Behavior</h6>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            <label className="text-xs">Desktop</label>
                            <button
                              onClick={() => updateFrameDeviceConfig('desktop', 'enabled', !frameConfig.desktop?.enabled)}
                              className={`ml-auto px-2 py-1 rounded text-xs ${
                                frameConfig.desktop?.enabled ? 'bg-brand-700 text-white' : 'bg-secondary'
                              }`}
                            >
                              {frameConfig.desktop?.enabled ? 'On' : 'Off'}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tablet className="w-4 h-4" />
                            <label className="text-xs">Tablet</label>
                            <button
                              onClick={() => updateFrameDeviceConfig('tablet', 'enabled', !frameConfig.tablet?.enabled)}
                              className={`ml-auto px-2 py-1 rounded text-xs ${
                                frameConfig.tablet?.enabled ? 'bg-brand-700 text-white' : 'bg-secondary'
                              }`}
                            >
                              {frameConfig.tablet?.enabled ? 'On' : 'Off'}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            <label className="text-xs">Mobile</label>
                            <button
                              onClick={() => updateFrameDeviceConfig('mobile', 'enabled', !frameConfig.mobile?.enabled)}
                              className={`ml-auto px-2 py-1 rounded text-xs ${
                                frameConfig.mobile?.enabled ? 'bg-brand-700 text-white' : 'bg-secondary'
                              }`}
                            >
                              {frameConfig.mobile?.enabled ? 'On' : 'Off'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Frame Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Frame Width</label>
                          <input 
                            type="text"
                            value={frameConfig.width || "100%"}
                            onChange={(e) => updateFrameConfig('width', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="100%"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Frame Height</label>
                          <input 
                            type="text"
                            value={frameConfig.height || "auto"}
                            onChange={(e) => updateFrameConfig('height', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="auto"
                          />
                        </div>
                      </div>

                      {/* Frame Styling */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Border Radius</label>
                          <input 
                            type="text"
                            value={frameConfig.borderRadius || "1.5rem"}
                            onChange={(e) => updateFrameConfig('borderRadius', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="1.5rem"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Shadow</label>
                          <input 
                            type="text"
                            value={frameConfig.shadow || "0 25px 50px -12px rgba(0, 0, 0, 0.25)"}
                            onChange={(e) => updateFrameConfig('shadow', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                          />
                        </div>
                      </div>

                      {/* Border */}
                      <div>
                        <label className="block text-sm mb-1">Border</label>
                        <select 
                          value={frameConfig.border || "subtle"}
                          onChange={(e) => updateFrameConfig('border', e.target.value as any)}
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="none">None</option>
                          <option value="subtle">Subtle</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      {frameConfig.border === "custom" && (
                        <div>
                          <label className="block text-sm mb-1">Custom Border</label>
                          <input 
                            type="text"
                            value={frameConfig.customBorder || ""}
                            onChange={(e) => updateFrameConfig('customBorder', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="1px solid rgba(255,255,255,0.1)"
                          />
                        </div>
                      )}

                      {/* Overflow */}
                      <div>
                        <label className="block text-sm mb-1">Overflow</label>
                        <select 
                          value={frameConfig.overflow || "hidden"}
                          onChange={(e) => updateFrameConfig('overflow', e.target.value as any)}
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="hidden">Hidden</option>
                          <option value="visible">Visible</option>
                        </select>
                      </div>

                      {/* Spacing */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Horizontal Spacing</label>
                          <input 
                            type="text"
                            value={frameConfig.horizontalSpacing || "1rem"}
                            onChange={(e) => updateFrameConfig('horizontalSpacing', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="1rem"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Vertical Spacing</label>
                          <input 
                            type="text"
                            value={frameConfig.verticalSpacing || "1rem"}
                            onChange={(e) => updateFrameConfig('verticalSpacing', e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="1rem"
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Image Fit</label>
                <select 
                  value={dimensions.imageFit || "cover"}
                  onChange={(e) => updateDimension("imageFit", e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Image Position</label>
                <select 
                  value={dimensions.imagePosition || "center"}
                  onChange={(e) => updateDimension("imagePosition", e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {dimensions.imagePosition === "custom" && (
                <>
                  <div>
                    <label className="block text-sm mb-1">X Position (%) - Range: 0-100</label>
                    <input 
                      type="number"
                      value={parseInt(dimensions.imagePositionX || "50")}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 0 && value <= 100) {
                          updateDimension("imagePositionX", `${value}%`);
                        }
                      }}
                      className="w-full border rounded-lg p-2"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Y Position (%) - Range: 0-100</label>
                    <input 
                      type="number"
                      value={parseInt(dimensions.imagePositionY || "50")}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 0 && value <= 100) {
                          updateDimension("imagePositionY", `${value}%`);
                        }
                      }}
                      className="w-full border rounded-lg p-2"
                      min={0}
                      max={100}
                    />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className="block text-sm mb-1">Border Radius</label>
                <input 
                  value={dimensions.borderRadius || "0.5rem"}
                  onChange={(e) => updateDimension("borderRadius", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Art Direction Panel */}
      {showArtDirection && (
        <div className="border rounded-xl p-4 bg-card space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" /> Art Direction
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${showGuides ? "bg-brand-700 text-white" : "bg-secondary"}`}
              >
                {showGuides ? "Hide Guides" : "Show Guides"}
              </button>
            </div>
          </div>

          {/* Composition Presets */}
          <div className="space-y-4">
            <h5 className="font-medium">Composition Presets</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(compositionPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPreset(key)}
                  className={`p-3 border rounded-lg text-left hover:bg-secondary transition-colors ${
                    selectedPreset === key ? "border-brand-500 bg-brand-50" : ""
                  }`}
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
            
            {selectedPreset && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    if (confirm(`Apply "${compositionPresets[selectedPreset as keyof typeof compositionPresets].name}" preset?\n\nThe current Hero composition will be updated.\nExisting layers will be adjusted while remaining fully editable.\n\nYou will need to save the composition after applying this preset.`)) {
                      console.log("[ART DIRECTION] Applying preset:", selectedPreset);
                      
                      const preset = compositionPresets[selectedPreset as keyof typeof compositionPresets];
                      
                      // Apply preset logic based on preset type
                      if (selectedPreset === "luxury-product") {
                        // Luxury Product preset
                        const updatedLayers = getCurrentLayers().map(layer => {
                          if (layer.type === "image") {
                            return {
                              ...layer,
                              displayMode: "3d-integrated" as const,
                              desktop: {
                                ...layer.desktop,
                                zIndex: 20,
                                depthScale: 110,
                                shadowPreset: "natural" as const,
                                lightingIntensity: 30,
                                lightingDirection: 135,
                                lightingSoftness: 50,
                                edgeSoftness: 20,
                                edgeGlow: 10,
                              },
                              tablet: {
                                ...layer.tablet,
                                zIndex: 20,
                                depthScale: 105,
                                shadowPreset: "natural" as const,
                                lightingIntensity: 25,
                                lightingDirection: 135,
                                lightingSoftness: 50,
                                edgeSoftness: 15,
                                edgeGlow: 8,
                              },
                              mobile: {
                                ...layer.mobile,
                                zIndex: 20,
                                depthScale: 100,
                                shadowPreset: "soft" as const,
                                lightingIntensity: 20,
                                lightingDirection: 135,
                                lightingSoftness: 50,
                                edgeSoftness: 10,
                                edgeGlow: 5,
                              },
                            };
                          }
                          if (layer.type === "text") {
                            return {
                              ...layer,
                              ctaStyle: "integrated" as const,
                              textTreatment: "integrated" as const,
                              ctaDepth: 20,
                              ctaPerspective: 1200,
                              ctaShadow: 15,
                              ctaGlow: 10,
                              desktop: {
                                ...layer.desktop,
                                zIndex: 30,
                              },
                              tablet: {
                                ...layer.tablet,
                                zIndex: 30,
                              },
                              mobile: {
                                ...layer.mobile,
                                zIndex: 30,
                              },
                            };
                          }
                          return layer;
                        });
                        
                        setComposition({ ...composition, slides: composition.slides.map((slide, sIdx) => 
                          sIdx === currentSlideIndex 
                            ? { ...slide, layers: updatedLayers }
                            : slide
                        )});
                        console.log("[ART DIRECTION] Luxury Product preset applied");
                      } else if (selectedPreset === "product-focus") {
                        // Product Focus preset
                        const updatedLayers = getCurrentLayers().map(layer => {
                          if (layer.type === "image") {
                            return {
                              ...layer,
                              displayMode: "3d-integrated" as const,
                              desktop: {
                                ...layer.desktop,
                                x: 50,
                                y: 50,
                                scale: 120,
                                zIndex: 25,
                                depthScale: 115,
                                shadowPreset: "deep" as const,
                                lightingIntensity: 40,
                                lightingDirection: 90,
                              },
                              tablet: {
                                ...layer.tablet,
                                x: 50,
                                y: 50,
                                scale: 110,
                                zIndex: 25,
                                depthScale: 110,
                                shadowPreset: "natural" as const,
                                lightingIntensity: 35,
                                lightingDirection: 90,
                              },
                              mobile: {
                                ...layer.mobile,
                                x: 50,
                                y: 50,
                                scale: 100,
                                zIndex: 25,
                                depthScale: 105,
                                shadowPreset: "soft" as const,
                                lightingIntensity: 30,
                                lightingDirection: 90,
                              },
                            };
                          }
                          return layer;
                        });
                        
                        setComposition({ ...composition, slides: composition.slides.map((slide, sIdx) => 
                          sIdx === currentSlideIndex 
                            ? { ...slide, layers: updatedLayers }
                            : slide
                        )});
                        console.log("[ART DIRECTION] Product Focus preset applied");
                      } else if (selectedPreset === "editorial") {
                        // Editorial preset
                        const updatedLayers = getCurrentLayers().map(layer => {
                          if (layer.type === "text") {
                            return {
                              ...layer,
                              textTreatment: "editorial" as const,
                              textOpacity: 95,
                              textShadow: "0 4px 8px rgba(0,0,0,0.5)",
                              fontSize: 32,
                              fontWeight: "700",
                              desktop: {
                                ...layer.desktop,
                                zIndex: 30,
                                y: 30,
                              },
                              tablet: {
                                ...layer.tablet,
                                zIndex: 30,
                                y: 35,
                              },
                              mobile: {
                                ...layer.mobile,
                                zIndex: 30,
                                y: 40,
                              },
                            };
                          }
                          if (layer.type === "image") {
                            return {
                              ...layer,
                              displayMode: "normal" as const,
                              desktop: {
                                ...layer.desktop,
                                zIndex: 10,
                                opacity: 80,
                                blendMode: "multiply" as const,
                              },
                              tablet: {
                                ...layer.tablet,
                                zIndex: 10,
                                opacity: 80,
                                blendMode: "multiply" as const,
                              },
                              mobile: {
                                ...layer.mobile,
                                zIndex: 10,
                                opacity: 80,
                                blendMode: "multiply" as const,
                              },
                            };
                          }
                          return layer;
                        });
                        
                        setComposition({ ...composition, slides: composition.slides.map((slide, sIdx) => 
                          sIdx === currentSlideIndex 
                            ? { ...slide, layers: updatedLayers }
                            : slide
                        )});
                        console.log("[ART DIRECTION] Editorial preset applied");
                      } else if (selectedPreset === "split-hero") {
                        // Split Hero preset
                        const updatedLayers = getCurrentLayers().map((layer: any, index: number) => {
                          if (layer.type === "image" && index === 0) {
                            return {
                              ...layer,
                              desktop: {
                                ...layer.desktop,
                                x: 30,
                                y: 50,
                                scale: 110,
                                zIndex: 15,
                                shadowPreset: "natural" as const,
                              },
                              tablet: {
                                ...layer.tablet,
                                x: 30,
                                y: 50,
                                scale: 100,
                                zIndex: 15,
                                shadowPreset: "soft" as const,
                              },
                              mobile: {
                                ...layer.mobile,
                                x: 50,
                                y: 45,
                                scale: 90,
                                zIndex: 15,
                                shadowPreset: "soft" as const,
                              },
                            };
                          }
                          if (layer.type === "text") {
                            return {
                              ...layer,
                              textAlign: "left" as const,
                              desktop: {
                                ...layer.desktop,
                                x: 70,
                                y: 50,
                                zIndex: 25,
                              },
                              tablet: {
                                ...layer.tablet,
                                x: 70,
                                y: 50,
                                zIndex: 25,
                              },
                              mobile: {
                                ...layer.mobile,
                                x: 50,
                                y: 70,
                                zIndex: 25,
                              },
                            };
                          }
                          return layer;
                        });
                        
                        setComposition({ ...composition, slides: composition.slides.map((slide, sIdx) => 
                          sIdx === currentSlideIndex 
                            ? { ...slide, layers: updatedLayers }
                            : slide
                        )});
                        console.log("[ART DIRECTION] Split Hero preset applied");
                      } else if (selectedPreset === "minimal") {
                        // Minimal preset
                        const updatedLayers = getCurrentLayers().map(layer => {
                          if (layer.type === "text") {
                            return {
                              ...layer,
                              textTreatment: "flat" as const,
                              textOpacity: 100,
                              textShadow: "none",
                              ctaStyle: "minimal" as const,
                              fontSize: 20,
                              fontWeight: "500",
                              desktop: {
                                ...layer.desktop,
                                zIndex: 20,
                                y: 60,
                              },
                              tablet: {
                                ...layer.tablet,
                                zIndex: 20,
                                y: 65,
                              },
                              mobile: {
                                ...layer.mobile,
                                zIndex: 20,
                                y: 70,
                              },
                            };
                          }
                          if (layer.type === "image") {
                            return {
                              ...layer,
                              displayMode: "normal" as const,
                              desktop: {
                                ...layer.desktop,
                                shadowPreset: "none" as const,
                                lightingIntensity: 0,
                              },
                              tablet: {
                                ...layer.tablet,
                                shadowPreset: "none" as const,
                                lightingIntensity: 0,
                              },
                              mobile: {
                                ...layer.mobile,
                                shadowPreset: "none" as const,
                                lightingIntensity: 0,
                              },
                            };
                          }
                          return layer;
                        });
                        
                        setComposition({ ...composition, slides: composition.slides.map((slide, sIdx) => 
                          sIdx === currentSlideIndex 
                            ? { ...slide, layers: updatedLayers }
                            : slide
                        )});
                        console.log("[ART DIRECTION] Minimal preset applied");
                      }
                      
                      // Preset application now triggers unsaved changes state
                      // The admin must explicitly save the composition
                      setSelectedPreset(null);
                    }
                  }}
                  className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800"
                >
                  Apply Preset
                </button>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Guide Options */}
          {showGuides && (
            <div className="space-y-4 pt-4 border-t">
              <h5 className="font-medium">Alignment Guides</h5>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Vertical Center</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Horizontal Center</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Safe Area</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Hero Bounds</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hero Composition Panel */}
      {showComposition && (
        <div className="border rounded-xl p-4 bg-card space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5" /> Hero Composition
              </h4>
              
              {/* Save Status Indicator */}
              {saveState === "unsaved" && (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span>Unsaved changes</span>
                </div>
              )}
              {saveState === "saved" && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved</span>
                </div>
              )}
              {saveState === "error" && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unable to save</span>
                </div>
              )}
            </div>
            
            {/* Save and Reset Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={saveState !== "unsaved"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  saveState === "unsaved"
                    ? "border border-gray-300 hover:bg-gray-100 text-gray-700"
                    : "border border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSaveComposition}
                disabled={saveState === "saving" || saveState === "saved"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  saveState === "saving"
                    ? "bg-gray-400 text-white cursor-wait"
                    : saveState === "saved"
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-brand-700 text-white hover:bg-brand-800"
                }`}
              >
                {saveState === "saving" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveState === "saved" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Composition
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Reset Confirmation Dialog */}
          {showResetConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-2">Discard changes?</h3>
                <p className="text-gray-600 mb-6">
                  Your unsaved Hero Composition changes will be discarded. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelReset}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReset}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Artwork Upload */}
          <div className="space-y-4">
            <h5 className="font-medium">Hero Artwork</h5>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {getCurrentArtwork().imageUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={getCurrentArtwork().imageUrl}
                      alt="Hero Artwork"
                      className="max-h-48 rounded-lg"
                    />
                    <button
                      onClick={() => updateCurrentSlide({ artwork: { imageUrl: '', imagePublicId: '', imageWidth: 0, imageHeight: 0 } })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getCurrentArtwork().imageWidth && getCurrentArtwork().imageHeight && (
                      <span>Dimensions: {getCurrentArtwork().imageWidth}x{getCurrentArtwork().imageHeight}px</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload hero artwork image</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => e.target.files?.[0] && handleArtworkUpload(e.target.files[0])}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? "Uploading..." : "Choose Image"}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Layer Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Hero Layers</h5>
              <div className="flex gap-2">
                <button
                  onClick={addImageLayer}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                >
                  <ImageIcon className="w-4 h-4" /> Add Image Layer
                </button>
                <button
                  onClick={addTextLayer}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                >
                  <Type className="w-4 h-4" /> Add Text Layer
                </button>
              </div>
            </div>

            {/* Layer List */}
            <div className="space-y-2">
              {getCurrentLayers().length === 0 ? (
                <p className="text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No layers added yet. Add an image or text layer to get started.
                </p>
              ) : (
                getCurrentLayers().map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedLayerId === layer.id ? "border-brand-500 bg-brand-50" : "hover:bg-secondary"
                    }`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(index, Math.max(0, index - 1));
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(index, Math.min(getCurrentLayers().length - 1, index + 1));
                          }}
                          disabled={index === getCurrentLayers().length - 1}
                          className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {layer.type === "image" ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <Type className="w-4 h-4" />
                        )}
                        <span className="font-medium">{layer.name}</span>
                        {layer.displayMode && (
                          <span className="text-xs text-muted-foreground capitalize">
                            ({layer.displayMode.replace("-", " ")})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateLayer(layer.id);
                          }}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="p-1 hover:bg-red-100 text-red-500 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Layer Editor */}
          {selectedLayer && selectedLayerId && (
            <div className="border-t pt-4 space-y-4">
              <h5 className="font-medium">Edit Layer: {selectedLayer.name}</h5>
              
              {/* Common Layer Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Layer Name</label>
                  <input
                    type="text"
                    value={selectedLayer.name}
                    onChange={(e) => updateLayer(selectedLayerId, { name: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id={`visible-${selectedLayerId}`}
                    checked={selectedLayer.visible}
                    onChange={(e) => updateLayer(selectedLayerId, { visible: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor={`visible-${selectedLayerId}`} className="text-sm">Visible</label>
                </div>
              </div>

              {/* Image Layer Settings */}
              {selectedLayer.type === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Layer Image</label>
                    {selectedLayer.imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={selectedLayer.imageUrl}
                          alt={selectedLayer.name}
                          className="max-h-32 rounded-lg"
                        />
                        <button
                          onClick={() => updateLayer(selectedLayerId, { imageUrl: "", imagePublicId: "" })}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(e) => e.target.files?.[0] && handleLayerImageUpload(selectedLayerId, e.target.files[0])}
                          className="hidden"
                        />
                        Upload Layer Image
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Display Mode</label>
                    <select
                      value={selectedLayer.displayMode || "normal"}
                      onChange={(e) => updateLayer(selectedLayerId, { displayMode: e.target.value as any })}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="normal">Normal</option>
                      <option value="3d-integrated">3D Integrated</option>
                      <option value="floating">Floating</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Text Layer Settings */}
              {selectedLayer.type === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Text Content</label>
                    <input
                      type="text"
                      value={selectedLayer.text || ""}
                      onChange={(e) => updateLayer(selectedLayerId, { text: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Font Size (px)</label>
                      <input
                        type="number"
                        value={selectedLayer.fontSize || 24}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 12 && value <= 72) {
                            updateLayer(selectedLayerId, { fontSize: value });
                          }
                        }}
                        className="w-full border rounded-lg p-2"
                        min={12}
                        max={72}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Font Weight</label>
                      <select
                        value={selectedLayer.fontWeight || "600"}
                        onChange={(e) => updateLayer(selectedLayerId, { fontWeight: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="400">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="700">Bold</option>
                        <option value="800">Extra Bold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Letter Spacing (px)</label>
                      <input
                        type="number"
                        value={selectedLayer.letterSpacing || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= -2 && value <= 10) {
                            updateLayer(selectedLayerId, { letterSpacing: value });
                          }
                        }}
                        className="w-full border rounded-lg p-2"
                        step={0.5}
                        min={-2}
                        max={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Color</label>
                      <input
                        type="color"
                        value={selectedLayer.textColor || "#ffffff"}
                        onChange={(e) => updateLayer(selectedLayerId, { textColor: e.target.value })}
                        className="w-full h-10 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Align</label>
                      <select
                        value={selectedLayer.textAlign || "center"}
                        onChange={(e) => updateLayer(selectedLayerId, { textAlign: e.target.value as any })}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CTA Style</label>
                      <select
                        value={selectedLayer.ctaStyle || "integrated"}
                        onChange={(e) => updateLayer(selectedLayerId, { ctaStyle: e.target.value as any })}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="standard">Standard</option>
                        <option value="integrated">Integrated</option>
                        <option value="3d">3D</option>
                        <option value="glass">Glass</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm mb-1">CTA Link (optional)</label>
                    <input
                      type="text"
                      value={selectedLayer.ctaLink || ""}
                      onChange={(e) => updateLayer(selectedLayerId, { ctaLink: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      placeholder="/products/..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm mb-1">Line Height</label>
                    <input
                      type="number"
                      value={selectedLayer.lineHeight || 1.2}
                      onChange={(e) => updateLayer(selectedLayerId, { lineHeight: parseFloat(e.target.value) })}
                      className="w-full border rounded-lg p-2"
                      step={0.1}
                      min={0.8}
                      max={2.5}
                    />
                  </div>
                </div>
              )}

              {/* Premium Typography Art Direction */}
              {selectedLayer.type === "text" && (
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Typography Art Direction</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Text Treatment</label>
                      <select
                        value={selectedLayer.textTreatment || "integrated"}
                        onChange={(e) => updateLayer(selectedLayerId, { textTreatment: e.target.value as any })}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="flat">Flat</option>
                        <option value="editorial">Editorial</option>
                        <option value="integrated">Integrated</option>
                        <option value="3d">3D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Opacity (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer.textOpacity || 100}
                        onChange={(e) => updateLayer(selectedLayerId, { textOpacity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.textOpacity || 100}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Shadow</label>
                      <input
                        type="text"
                        value={selectedLayer.textShadow || "0 2px 4px rgba(0,0,0,0.3)"}
                        onChange={(e) => updateLayer(selectedLayerId, { textShadow: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        placeholder="0 2px 4px rgba(0,0,0,0.3)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Glow (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer.textGlow || 0}
                        onChange={(e) => updateLayer(selectedLayerId, { textGlow: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.textGlow || 0}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Rotation (°)</label>
                      <input
                        type="range"
                        min={-30}
                        max={30}
                        value={selectedLayer.textRotation || 0}
                        onChange={(e) => updateLayer(selectedLayerId, { textRotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.textRotation || 0}°</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Text Perspective (px)</label>
                      <input
                        type="range"
                        min={100}
                        max={2000}
                        value={selectedLayer.textPerspective || 1000}
                        onChange={(e) => updateLayer(selectedLayerId, { textPerspective: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.textPerspective || 1000}px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Depth System - Only for text layers */}
              {selectedLayer.type === "text" && (
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">CTA Depth System</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">CTA Depth (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer.ctaDepth || 0}
                        onChange={(e) => updateLayer(selectedLayerId, { ctaDepth: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.ctaDepth || 0}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CTA Perspective (px)</label>
                      <input
                        type="range"
                        min={100}
                        max={2000}
                        value={selectedLayer.ctaPerspective || 1000}
                        onChange={(e) => updateLayer(selectedLayerId, { ctaPerspective: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.ctaPerspective || 1000}px</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CTA Shadow (px)</label>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={selectedLayer.ctaShadow || 20}
                        onChange={(e) => updateLayer(selectedLayerId, { ctaShadow: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.ctaShadow || 20}px</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CTA Glow (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer.ctaGlow || 0}
                        onChange={(e) => updateLayer(selectedLayerId, { ctaGlow: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.ctaGlow || 0}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CTA Offset (px)</label>
                      <input
                        type="range"
                        min={-20}
                        max={20}
                        value={selectedLayer.ctaOffset || 0}
                        onChange={(e) => updateLayer(selectedLayerId, { ctaOffset: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer.ctaOffset || 0}px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Responsive Positioning */}
              <div className="space-y-4">
                <h6 className="font-medium text-sm">Responsive Positioning</h6>
                
                {/* Device Tabs */}
                <div className="flex gap-2">
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "desktop" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "tablet" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                    onClick={() => setPreviewDevice("tablet")}
                  >
                    <Tablet className="w-4 h-4" /> Tablet
                  </button>
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "mobile" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="w-4 h-4" /> Mobile
                  </button>
                </div>

                {/* Position Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">X Position (%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedLayer[previewDevice].x}
                      onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { x: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Y Position (%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedLayer[previewDevice].y}
                      onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { y: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].y}%</span>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Scale (%)</label>
                    <input
                      type="range"
                      min={10}
                      max={200}
                      value={selectedLayer[previewDevice].scale}
                      onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { scale: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].scale}%</span>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Opacity (%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedLayer[previewDevice].opacity}
                      onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { opacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].opacity}%</span>
                  </div>
                </div>

                {/* 3D Controls for Integrated Mode */}
                {(selectedLayer.type === "image" && selectedLayer.displayMode === "3d-integrated") ||
                 (selectedLayer.type === "text" && selectedLayer.ctaStyle === "3d") ? (
                  <div className="space-y-4 pt-4 border-t">
                    <h6 className="font-medium text-sm">3D Effects</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Rotation X (°)</label>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedLayer[previewDevice].rotationX}
                          onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { rotationX: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].rotationX}°</span>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Rotation Y (°)</label>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedLayer[previewDevice].rotationY}
                          onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { rotationY: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].rotationY}°</span>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Rotation Z (°)</label>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedLayer[previewDevice].rotationZ}
                          onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { rotationZ: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].rotationZ}°</span>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Perspective (px)</label>
                        <input
                          type="range"
                          min={100}
                          max={2000}
                          value={selectedLayer[previewDevice].perspective}
                          onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { perspective: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].perspective}px</span>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Shadow (px)</label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedLayer[previewDevice].shadow}
                          onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadow: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].shadow}px</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Depth / Z-Axis Controls */}
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Depth / Z-Axis</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Z Index</label>
                      <input
                        type="number"
                        value={selectedLayer[previewDevice].zIndex || 10}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { zIndex: parseInt(e.target.value) })}
                        className="w-full border rounded-lg p-2"
                        min={1}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Depth Scale (%)</label>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        value={selectedLayer[previewDevice].depthScale || 100}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { depthScale: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].depthScale || 100}%</span>
                    </div>
                  </div>
                </div>

                {/* Masking Controls */}
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Masking</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Mask Mode</label>
                      <select
                        value={selectedLayer[previewDevice].mask || "none"}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { mask: e.target.value as any })}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="none">None</option>
                        <option value="soft-edge">Soft Edge</option>
                        <option value="gradient">Gradient</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    {(selectedLayer[previewDevice].mask === "soft-edge" || selectedLayer[previewDevice].mask === "gradient") && (
                      <div>
                        <label className="block text-sm mb-1">Mask Softness (%)</label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedLayer[previewDevice].maskSoftness || 50}
                          onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { maskSoftness: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].maskSoftness || 50}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Blend Mode */}
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Blend Mode</h6>
                  <select
                    value={selectedLayer[previewDevice].blendMode || "normal"}
                    onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { blendMode: e.target.value as any })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                  </select>
                </div>

                {/* Lighting Controls */}
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Lighting</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Intensity (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer[previewDevice].lightingIntensity || 0}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { lightingIntensity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].lightingIntensity || 0}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Direction (°)</label>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={selectedLayer[previewDevice].lightingDirection || 135}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { lightingDirection: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].lightingDirection || 135}°</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Softness (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer[previewDevice].lightingSoftness || 50}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { lightingSoftness: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].lightingSoftness || 50}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Ambient (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer[previewDevice].lightingAmbient || 100}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { lightingAmbient: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].lightingAmbient || 100}%</span>
                    </div>
                  </div>
                </div>

                {/* Premium Shadow System */}
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Premium Shadow</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Shadow Preset</label>
                      <select
                        value={selectedLayer[previewDevice].shadowPreset || "natural"}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadowPreset: e.target.value as any })}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="none">None</option>
                        <option value="soft">Soft</option>
                        <option value="natural">Natural</option>
                        <option value="deep">Deep</option>
                        <option value="floating">Floating</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    {selectedLayer[previewDevice].shadowPreset === "custom" && (
                      <>
                        <div>
                          <label className="block text-sm mb-1">Opacity (%)</label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={selectedLayer[previewDevice].shadowOpacity || 100}
                            onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadowOpacity: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].shadowOpacity || 100}%</span>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Blur (px)</label>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            value={selectedLayer[previewDevice].shadowBlur || 20}
                            onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadowBlur: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].shadowBlur || 20}px</span>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Spread (px)</label>
                          <input
                            type="range"
                            min={-20}
                            max={20}
                            value={selectedLayer[previewDevice].shadowSpread || 0}
                            onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadowSpread: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].shadowSpread || 0}px</span>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">X Offset (px)</label>
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={selectedLayer[previewDevice].shadowX || 0}
                            onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadowX: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].shadowX || 0}px</span>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Y Offset (px)</label>
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={selectedLayer[previewDevice].shadowY || 0}
                            onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { shadowY: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].shadowY || 0}px</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Edge Integration */}
                <div className="space-y-4 pt-4 border-t">
                  <h6 className="font-medium text-sm">Edge Integration</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Softness (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer[previewDevice].edgeSoftness || 0}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { edgeSoftness: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].edgeSoftness || 0}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Glow (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer[previewDevice].edgeGlow || 0}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { edgeGlow: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].edgeGlow || 0}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Contrast (%)</label>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        value={selectedLayer[previewDevice].edgeContrast || 100}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { edgeContrast: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].edgeContrast || 100}%</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Highlight (%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedLayer[previewDevice].edgeHighlight || 0}
                        onChange={(e) => updateLayerPosition(selectedLayerId, previewDevice, { edgeHighlight: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{selectedLayer[previewDevice].edgeHighlight || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Composition Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Live Composition Preview</h5>
              <div className="flex gap-2">
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "mobile" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "tablet" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                  onClick={() => setPreviewDevice("tablet")}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${previewDevice === "desktop" ? "bg-brand-700 text-white" : "bg-secondary"}`}
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-100">
              <div
                className="relative overflow-hidden bg-gray-900"
                style={getPreviewStyle()}
              >
                {/* Safe Area Guides */}
                {showGuides && (
                  <>
                    <div className="absolute inset-4 border-2 border-dashed border-yellow-400/30 pointer-events-none">
                      <div className="absolute top-0 left-0 bg-yellow-400/50 text-xs px-1">Safe Area</div>
                    </div>
                    {/* Center guides */}
                    <div className="absolute top-0 left-1/2 w-px h-full bg-yellow-400/30 pointer-events-none" />
                    <div className="absolute top-1/2 left-0 w-full h-px bg-yellow-400/30 pointer-events-none" />
                  </>
                )}

                {/* Safe Area Warnings */}
                {getCurrentLayers()
                  .filter(layer => layer.visible)
                  .map((layer) => {
                    const position = layer[previewDevice];
                    const isOutsideSafeArea = position.x < 10 || position.x > 90 || position.y < 10 || position.y > 90;
                    
                    return (
                      <div
                        key={layer.id}
                        className={`absolute border-2 rounded-full p-1 ${
                          isOutsideSafeArea 
                            ? "bg-red-500/20 border-red-500" 
                            : "bg-green-500/20 border-green-500"
                        }`}
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          transform: "translate(-50%, -50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <span className={`text-xs ${isOutsideSafeArea ? "text-red-500" : "text-green-500"}`}>
                          {isOutsideSafeArea ? "⚠ Outside Safe Area" : "✓ Safe"}
                        </span>
                      </div>
                    );
                  })}

                {/* Hero Artwork */}
                {getCurrentArtwork().imageUrl && (
                  <img
                    src={getCurrentArtwork().imageUrl}
                    alt="Hero Artwork"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Layers */}
                {getCurrentLayers()
                  .filter(layer => layer.visible)
                  .map((layer) => {
                    const position = layer[previewDevice];
                    const layerStyle: React.CSSProperties = {
                      position: "absolute",
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) scale(${position.scale / 100}) rotateX(${position.rotationX}deg) rotateY(${position.rotationY}deg) rotateZ(${position.rotationZ}deg)`,
                      opacity: position.opacity / 100,
                      perspective: `${position.perspective}px`,
                      boxShadow: layer.displayMode === "3d-integrated" || layer.ctaStyle === "3d" 
                        ? `${position.shadow}px ${position.shadow}px ${position.shadow * 2}px rgba(0,0,0,0.3)` 
                        : undefined,
                    };

                    if (layer.type === "image" && layer.imageUrl) {
                      return (
                        <div key={layer.id} style={layerStyle}>
                          <img
                            src={layer.imageUrl}
                            alt={layer.name}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              transformStyle: layer.displayMode === "3d-integrated" ? "preserve-3d" : undefined,
                            }}
                          />
                        </div>
                      );
                    }

                    if (layer.type === "text" && layer.text) {
                      const textStyle: React.CSSProperties = {
                        ...layerStyle,
                        fontSize: `${layer.fontSize}px`,
                        fontWeight: layer.fontWeight,
                        letterSpacing: `${layer.letterSpacing}px`,
                        color: layer.textColor,
                        textAlign: layer.textAlign,
                      };

                      // Apply CTA styles
                      if (layer.ctaStyle === "integrated") {
                        textStyle.textShadow = "0 2px 4px rgba(0,0,0,0.3)";
                      } else if (layer.ctaStyle === "glass") {
                        textStyle.background = "rgba(255,255,255,0.1)";
                        textStyle.backdropFilter = "blur(10px)";
                        textStyle.padding = "12px 24px";
                        textStyle.borderRadius = "8px";
                        textStyle.border = "1px solid rgba(255,255,255,0.2)";
                      } else if (layer.ctaStyle === "minimal") {
                        textStyle.borderBottom = "2px solid currentColor";
                        textStyle.paddingBottom = "4px";
                      }

                      return (
                        <div key={layer.id} style={textStyle}>
                          {layer.text}
                        </div>
                      );
                    }

                    return null;
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slides Section - NEW MULTI-SLIDE HERO COMPOSITION */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Hero Slides</h3>
        <button onClick={addSlide} className="flex items-center gap-2 px-3 py-1.5 bg-brand-700 text-white rounded-lg hover:bg-brand-800">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="space-y-4">
        {composition.slides.map((slide, index) => (
          <div key={slide.id} className={`p-4 border rounded-xl bg-card space-y-4 ${index === currentSlideIndex ? 'border-brand-500 bg-brand-50' : ''}`}>
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Slide {index + 1}</span>
                {!slide.enabled && <span className="text-xs text-gray-500">(Disabled)</span>}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentSlideIndex(index)}
                  className="text-brand-600 hover:bg-brand-50 p-1 rounded"
                  title="Edit this slide"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => duplicateSlide(index)}
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                  title="Duplicate slide"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleSlideEnabled(index)}
                  className={`${slide.enabled ? "text-green-600 hover:bg-green-50" : "text-gray-500 hover:bg-gray-100"} p-1 rounded`}
                  title={slide.enabled ? "Disable slide" : "Enable slide"}
                >
                  {slide.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {composition.slides.length > 1 && (
                  <button 
                    onClick={() => deleteSlide(index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Slide preview */}
            {slide.artwork.imageUrl && (
              <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={slide.artwork.imageUrl} 
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {slide.layers.length} layers • {slide.duration}s
                </div>
              </div>
            )}
            
            {/* Slide settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Duration (s)</label>
                <input 
                  type="number" 
                  min="2" 
                  max="10"
                  value={slide.duration || 5}
                  onChange={(e) => updateCurrentSlide({ duration: parseInt(e.target.value) || 5 })}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Transition</label>
                <select 
                  value={slide.transition || 'cinematic'}
                  onChange={(e) => updateCurrentSlide({ transition: e.target.value as any })}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="fade">Fade</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="slide">Slide</option>
                  <option value="scale">Scale</option>
                  <option value="crossfade">Crossfade</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {composition.slides.length === 0 && (
          <p className="text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            No slides configured. Click "Add Slide" to create your first Hero slide.
          </p>
        )}
      </div>
    </div>
  );
}
