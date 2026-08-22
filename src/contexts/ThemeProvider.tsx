"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ThemeConfig } from "@/types/theme";
import { ThemeVersion } from "@/types/theme";
import { defaultThemes } from "@/lib/themes/default-themes";

interface ThemeContextValue {
  theme: ThemeConfig;
  themeVersion: ThemeVersion;
  setTheme: (version: ThemeVersion) => void;
  previewTheme: (version: ThemeVersion) => void;
  clearPreview: () => void;
  isPreviewing: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeVersion;
}) {
  const [themeVersion, setThemeVersion] = useState<ThemeVersion>(
    initialTheme || ThemeVersion.V1_CLASSIC
  );
  const [theme, setThemeState] = useState<ThemeConfig>(defaultThemes["V1_CLASSIC"]);
  const [previewedTheme, setPreviewedTheme] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch active theme from API
    const fetchActiveTheme = async () => {
      try {
        console.log("[ThemeProvider] Fetching active theme from API...");
        const res = await fetch("/api/theme/active");
        console.log("[ThemeProvider] API response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("[ThemeProvider] API response data:", data);
          if (data.success && data.theme) {
            setThemeState(data.theme);
            setThemeVersion(data.theme.version);
            localStorage.setItem("theme-version", data.theme.version);
            console.log("[ThemeProvider] Theme applied successfully:", data.theme.version);
          }
        } else {
          console.error("[ThemeProvider] API response not OK:", res.status);
        }
      } catch (error) {
        console.error("[ThemeProvider] Failed to fetch active theme:", error);
        // Fallback to localStorage or default
        const savedTheme = localStorage.getItem("theme-version") as ThemeVersion;
        if (savedTheme && defaultThemes[savedTheme]) {
          setThemeVersion(savedTheme);
          setThemeState(defaultThemes[savedTheme]);
          console.log("[ThemeProvider] Using fallback theme from localStorage:", savedTheme);
        } else if (initialTheme && defaultThemes[initialTheme]) {
          setThemeVersion(initialTheme);
          setThemeState(defaultThemes[initialTheme]);
          console.log("[ThemeProvider] Using fallback initial theme:", initialTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveTheme();
  }, [initialTheme]);

  const setTheme = (version: ThemeVersion) => {
    if (defaultThemes[version]) {
      setThemeVersion(version);
      setThemeState(defaultThemes[version]);
      localStorage.setItem("theme-version", version);
      setPreviewedTheme(null);
    }
  };

  const previewTheme = (version: ThemeVersion) => {
    if (defaultThemes[version]) {
      setPreviewedTheme(defaultThemes[version]);
    }
  };

  const clearPreview = () => {
    setPreviewedTheme(null);
  };

  const isPreviewing = previewedTheme !== null;
  const activeTheme = isPreviewing ? previewedTheme : theme;

  // Apply CSS variables for theme colors immediately
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const colors = activeTheme.colorPalette;
  
  const hexToHsl = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Apply CSS variables immediately
  if (root) {
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-foreground', colors.foreground);
    root.style.setProperty('--theme-muted', colors.muted);
    root.style.setProperty('--theme-muted-foreground', colors.mutedForeground);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-card', colors.card);
    root.style.setProperty('--theme-card-foreground', colors.cardForeground);
    root.style.setProperty('--theme-destructive', colors.destructive);
    root.style.setProperty('--theme-destructive-foreground', colors.destructiveForeground);
    
    root.style.setProperty('--theme-primary-hsl', hexToHsl(colors.primary));
    root.style.setProperty('--theme-secondary-hsl', hexToHsl(colors.secondary));
    root.style.setProperty('--theme-accent-hsl', hexToHsl(colors.accent));
    root.style.setProperty('--theme-background-hsl', hexToHsl(colors.background));
    root.style.setProperty('--theme-foreground-hsl', hexToHsl(colors.foreground));
    root.style.setProperty('--theme-muted-hsl', hexToHsl(colors.muted));
    root.style.setProperty('--theme-muted-foreground-hsl', hexToHsl(colors.mutedForeground));
    root.style.setProperty('--theme-border-hsl', hexToHsl(colors.border));
    root.style.setProperty('--theme-card-hsl', hexToHsl(colors.card));
    root.style.setProperty('--theme-card-foreground-hsl', hexToHsl(colors.cardForeground));
    root.style.setProperty('--theme-destructive-hsl', hexToHsl(colors.destructive));
    root.style.setProperty('--theme-destructive-foreground-hsl', hexToHsl(colors.destructiveForeground));
    
    root.style.setProperty('--primary', hexToHsl(colors.primary));
    root.style.setProperty('--secondary', hexToHsl(colors.secondary));
    root.style.setProperty('--accent', hexToHsl(colors.accent));
    root.style.setProperty('--background', hexToHsl(colors.background));
    root.style.setProperty('--foreground', hexToHsl(colors.foreground));
    root.style.setProperty('--muted', hexToHsl(colors.muted));
    root.style.setProperty('--muted-foreground', hexToHsl(colors.mutedForeground));
    root.style.setProperty('--border', hexToHsl(colors.border));
    root.style.setProperty('--card', hexToHsl(colors.card));
    root.style.setProperty('--card-foreground', hexToHsl(colors.cardForeground));
    root.style.setProperty('--destructive', hexToHsl(colors.destructive));
    root.style.setProperty('--destructive-foreground', hexToHsl(colors.destructiveForeground));
    root.style.setProperty('--ring', hexToHsl(colors.primary));
  }

  // Apply CSS variables for theme colors (useEffect for updates)
  useEffect(() => {
    const root = document.documentElement;
    const colors = activeTheme.colorPalette;
    
    // Set theme-specific CSS variables (hex)
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-foreground', colors.foreground);
    root.style.setProperty('--theme-muted', colors.muted);
    root.style.setProperty('--theme-muted-foreground', colors.mutedForeground);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-card', colors.card);
    root.style.setProperty('--theme-card-foreground', colors.cardForeground);
    root.style.setProperty('--theme-destructive', colors.destructive);
    root.style.setProperty('--theme-destructive-foreground', colors.destructiveForeground);
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-info', colors.info);
    
    // Convert hex colors to HSL for Tailwind CSS variables
    const hexToHsl = (hex: string) => {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    // Update HSL CSS variables for Tailwind
    root.style.setProperty('--theme-primary-hsl', hexToHsl(colors.primary));
    root.style.setProperty('--theme-secondary-hsl', hexToHsl(colors.secondary));
    root.style.setProperty('--theme-accent-hsl', hexToHsl(colors.accent));
    root.style.setProperty('--theme-background-hsl', hexToHsl(colors.background));
    root.style.setProperty('--theme-foreground-hsl', hexToHsl(colors.foreground));
    root.style.setProperty('--theme-muted-hsl', hexToHsl(colors.muted));
    root.style.setProperty('--theme-muted-foreground-hsl', hexToHsl(colors.mutedForeground));
    root.style.setProperty('--theme-border-hsl', hexToHsl(colors.border));
    root.style.setProperty('--theme-card-hsl', hexToHsl(colors.card));
    root.style.setProperty('--theme-card-foreground-hsl', hexToHsl(colors.cardForeground));
    root.style.setProperty('--theme-destructive-hsl', hexToHsl(colors.destructive));
    root.style.setProperty('--theme-destructive-foreground-hsl', hexToHsl(colors.destructiveForeground));
    
    // Update main Tailwind CSS variables directly
    root.style.setProperty('--primary', hexToHsl(colors.primary));
    root.style.setProperty('--secondary', hexToHsl(colors.secondary));
    root.style.setProperty('--accent', hexToHsl(colors.accent));
    root.style.setProperty('--background', hexToHsl(colors.background));
    root.style.setProperty('--foreground', hexToHsl(colors.foreground));
    root.style.setProperty('--muted', hexToHsl(colors.muted));
    root.style.setProperty('--muted-foreground', hexToHsl(colors.mutedForeground));
    root.style.setProperty('--border', hexToHsl(colors.border));
    root.style.setProperty('--card', hexToHsl(colors.card));
    root.style.setProperty('--card-foreground', hexToHsl(colors.cardForeground));
    root.style.setProperty('--destructive', hexToHsl(colors.destructive));
    root.style.setProperty('--destructive-foreground', hexToHsl(colors.destructiveForeground));
    root.style.setProperty('--ring', hexToHsl(colors.primary));
    
    console.log("[ThemeProvider] CSS variables updated with theme colors");
  }, [activeTheme.colorPalette]);

  // Apply custom CSS if present
  useEffect(() => {
    if (activeTheme.customCSS) {
      const styleId = "theme-custom-css";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = activeTheme.customCSS;
    }
  }, [activeTheme.customCSS]);

  // Apply custom JS if present
  useEffect(() => {
    if (activeTheme.customJS) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const func = new Function(activeTheme.customJS);
        func();
      } catch (error) {
        console.error("Error executing custom theme JS:", error);
      }
    }
  }, [activeTheme.customJS]);

  return (
    <ThemeContext.Provider value={{ 
      theme: activeTheme, 
      themeVersion: isPreviewing ? activeTheme.version : themeVersion, 
      setTheme, 
      previewTheme,
      clearPreview,
      isPreviewing,
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
