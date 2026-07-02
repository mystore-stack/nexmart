'use client';

import { useState, useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { Section, Theme } from '../types';
import { Layout, Layers, Square, ImageIcon, ShoppingBag, Package, Image, Share2, FileText, MessageSquare, Menu, MousePointer2, Sparkles, BarChart3, Star, Search, Heart, Clock } from 'lucide-react';
import { CMSContentStatus } from '@prisma/client';

// Icon mapping for section types
const SECTION_ICON_MAP: Record<string, any> = {
  'hero-banner': Layout,
  'features': Square,
  'featured-products': ShoppingBag,
  'categories': Package,
  'gallery': Image,
  'testimonials': MessageSquare,
  'newsletter': FileText,
  'banner': Share2,
  'cta': Sparkles,
  'stats': BarChart3,
  'reviews': Star,
  'search': Search,
  'wishlist': Heart,
  'countdown': Clock,
  'default': Layout,
};

interface HomepageBuilderState {
  sections: Section[];
  selectedSection: Section | null;
  selectedDevice: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'small-mobile';
  theme: Theme;
  history: Section[][];
  historyIndex: number;
  pageId: string | null;
  status: CMSContentStatus;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
}

const INITIAL_SECTIONS: Section[] = [
  {
    id: 'hero-banner',
    type: 'hero-banner',
    name: 'Hero Banner',
    icon: Layout,
    enabled: true,
    visible: true,
    locked: false,
    content: {
      title: 'Welcome to NexMart',
      subtitle: 'Discover the finest Moroccan luxury products',
      description: 'Experience premium shopping with curated collections from the best Moroccan artisans',
      cta: 'Shop Now',
      ctaLink: '/shop'
    },
    design: {
      color: '#0F766E',
      radius: '16px',
      shadow: 'lg',
      background: 'linear-gradient(135deg, #0F172A 0%, #0a2a26 50%, #0F172A 100%)',
      backgroundType: 'gradient'
    },
    layout: {
      width: '100%',
      padding: '2rem',
      margin: '0',
      alignment: 'center'
    },
    animation: {
      type: 'fade',
      duration: 600,
      delay: 0
    }
  },
  {
    id: 'features',
    type: 'features',
    name: 'Features',
    icon: Square,
    enabled: true,
    visible: true,
    locked: false,
    content: {
      title: 'Why Choose Us',
      subtitle: 'Premium quality and exceptional service'
    },
    design: {
      radius: '16px',
      shadow: 'md'
    },
    layout: {
      width: 'container',
      padding: '4rem 2rem',
      margin: '0'
    }
  },
  {
    id: 'featured-products',
    type: 'featured-products',
    name: 'Featured Products',
    icon: Square,
    enabled: true,
    visible: true,
    locked: false,
    content: {
      title: 'Featured Collection',
      subtitle: 'Handpicked luxury items'
    },
    design: {
      radius: '16px',
      shadow: 'md'
    },
    layout: {
      width: 'container',
      padding: '4rem 2rem',
      margin: '0'
    }
  },
  {
    id: 'categories',
    type: 'categories',
    name: 'Categories',
    icon: Layers,
    enabled: true,
    visible: true,
    locked: false,
    content: {
      title: 'Browse Categories',
      subtitle: 'Explore our diverse collections'
    },
    design: {
      radius: '16px',
      shadow: 'md'
    },
    layout: {
      width: 'container',
      padding: '4rem 2rem',
      margin: '0'
    }
  }
];

const INITIAL_THEME: Theme = {
  colors: {
    primary: '#0F766E',
    secondary: '#D4AF37',
    accent: '#C25B33',
    background: '#FAFAF9',
    foreground: '#0F172A'
  },
  typography: {
    fontFamily: 'DM Sans',
    fontSize: {
      heading: '2.5rem',
      body: '1rem',
      small: '0.875rem'
    }
  },
  spacing: {
    section: '4rem',
    element: '1rem'
  },
  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '24px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 24px -4px rgba(0,0,0,0.08)',
    lg: '0 20px 60px -12px rgba(0,0,0,0.14)'
  }
};

export function useHomepageBuilder() {
  const [state, setState] = useState<HomepageBuilderState>({
    sections: INITIAL_SECTIONS,
    selectedSection: null,
    selectedDevice: 'desktop',
    theme: INITIAL_THEME,
    history: [INITIAL_SECTIONS],
    historyIndex: 0,
    pageId: null,
    status: CMSContentStatus.DRAFT,
    isSaving: false,
    isPublishing: false,
    lastSaved: null,
  });

  // Load homepage data on mount
  useEffect(() => {
    loadHomepage();
  }, []);

  const loadHomepage = async () => {
    try {
      console.log('[HOMEPAGE_BUILDER] Loading homepage...');
      const response = await fetch('/api/admin/homepage?pageType=HOME');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[HOMEPAGE_BUILDER] API error:', response.status, errorText);
        throw new Error(`Failed to load homepage: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const page = data.data;
        const loadedSections = page.sections.map((section: any) => ({
          id: section.id,
          type: section.sectionType,
          name: section.config?.name || section.sectionType,
          icon: SECTION_ICON_MAP[section.sectionType] || SECTION_ICON_MAP['default'],
          enabled: section.enabled ?? true,
          visible: section.enabled ?? true,
          locked: false,
          content: section.config?.content,
          design: section.config?.design,
          layout: section.config?.layout,
          animation: section.config?.animation,
          responsive: section.config?.responsive,
          seo: section.config?.seo,
        }));
        
        setState(prev => ({
          ...prev,
          sections: loadedSections,
          pageId: page.id,
          status: page.status,
          lastSaved: new Date(page.updatedAt),
          history: [loadedSections],
          historyIndex: 0,
        }));
        
        console.log('[HOMEPAGE_BUILDER] Homepage loaded:', page.id);
      }
    } catch (error) {
      console.error('[HOMEPAGE_BUILDER] Failed to load homepage:', error);
      // Don't throw - let the app continue with initial sections
    }
  };

  const selectSection = useCallback((section: Section) => {
    setState(prev => ({ ...prev, selectedSection: section }));
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    setState(prev => {
      const newSections = prev.sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      );
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newSections);
      return {
        ...prev,
        sections: newSections,
        selectedSection: prev.selectedSection?.id === id
          ? { ...prev.selectedSection, ...updates }
          : prev.selectedSection,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const addSection = useCallback((type: string) => {
    const newSection: Section = {
      id: `${type}-${Date.now()}`,
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
      icon: Layout,
      enabled: true,
      visible: true,
      locked: false
    };

    setState(prev => {
      const newSections = [...prev.sections, newSection];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newSections);
      return {
        ...prev,
        sections: newSections,
        selectedSection: newSection,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setState(prev => {
      const newSections = prev.sections.filter(section => section.id !== id);
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newSections);
      return {
        ...prev,
        sections: newSections,
        selectedSection: prev.selectedSection?.id === id ? null : prev.selectedSection,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const duplicateSection = useCallback((id: string) => {
    setState(prev => {
      const sectionToDuplicate = prev.sections.find(s => s.id === id);
      if (!sectionToDuplicate) return prev;

      const newSection: Section = {
        ...sectionToDuplicate,
        id: `${sectionToDuplicate.type}-${Date.now()}`,
        name: `${sectionToDuplicate.name} (Copy)`
      };

      const index = prev.sections.findIndex(s => s.id === id);
      const newSections = [
        ...prev.sections.slice(0, index + 1),
        newSection,
        ...prev.sections.slice(index + 1)
      ];

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newSections);

      return {
        ...prev,
        sections: newSections,
        selectedSection: newSection,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newSections = [...prev.sections];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newSections);

      return {
        ...prev,
        sections: newSections,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const setDevice = useCallback((device: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'small-mobile') => {
    setState(prev => ({ ...prev, selectedDevice: device }));
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        sections: prev.history[newIndex],
        historyIndex: newIndex
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        sections: prev.history[newIndex],
        historyIndex: newIndex
      };
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const saveDraft = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      console.log('[HOMEPAGE_BUILDER] Saving draft...', state.sections);

      const payload = {
        pageType: 'HOME',
        name: 'Homepage',
        slug: 'home',
        sections: state.sections,
        theme: state.theme,
        status: CMSContentStatus.DRAFT,
      };

      let response;
      if (state.pageId) {
        // Update existing
        response = await fetch('/api/admin/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: state.pageId,
            ...payload,
          }),
        });
      } else {
        // Try to create, but if it already exists, fetch the existing one and update
        response = await fetch('/api/admin/homepage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        // If homepage already exists, fetch it and update
        if (!response.ok && data.error === 'Homepage already exists') {
          console.log('[HOMEPAGE_BUILDER] Homepage already exists, fetching existing...');
          const fetchResponse = await fetch('/api/admin/homepage?pageType=HOME');
          const fetchData = await fetchResponse.json();
          
          if (fetchData.success && fetchData.data) {
            const existingPage = fetchData.data;
            setState(prev => ({ ...prev, pageId: existingPage.id }));
            
            // Now update the existing page
            response = await fetch('/api/admin/homepage', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: existingPage.id,
                ...payload,
              }),
            });
          } else {
            throw new Error(data.error || 'Failed to save');
          }
        } else if (!response.ok) {
          throw new Error(data.error || 'Failed to save');
        }
      }

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          pageId: data.data.id,
          status: data.data.status,
          lastSaved: new Date(),
          isSaving: false,
        }));
        console.log('[HOMEPAGE_BUILDER] Draft saved:', data.data.id);
        return true;
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('[HOMEPAGE_BUILDER] Save failed:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [state.sections, state.theme, state.pageId]);

  const publish = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPublishing: true }));
      console.log('[HOMEPAGE_BUILDER] Publishing...', state.sections);

      const payload = {
        pageType: 'HOME',
        name: 'Homepage',
        slug: 'home',
        sections: state.sections,
        theme: state.theme,
        status: CMSContentStatus.PUBLISHED,
        publishDate: new Date().toISOString(),
      };

      let response;
      if (state.pageId) {
        // Update existing
        response = await fetch('/api/admin/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: state.pageId,
            ...payload,
          }),
        });
      } else {
        // Create new
        response = await fetch('/api/admin/homepage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          pageId: data.data.id,
          status: data.data.status,
          lastSaved: new Date(),
          isPublishing: false,
        }));
        console.log('[HOMEPAGE_BUILDER] Published:', data.data.id);
        return true;
      } else {
        throw new Error(data.error || 'Failed to publish');
      }
    } catch (error: any) {
      console.error('[HOMEPAGE_BUILDER] Publish failed:', error);
      setState(prev => ({ ...prev, isPublishing: false }));
      throw error;
    }
  }, [state.sections, state.theme, state.pageId]);

  return {
    sections: state.sections,
    selectedSection: state.selectedSection,
    selectedDevice: state.selectedDevice,
    theme: state.theme,
    selectSection,
    updateSection,
    addSection,
    removeSection,
    duplicateSection,
    reorderSections,
    setDevice,
    undo,
    redo,
    canUndo,
    canRedo,
    saveDraft,
    publish,
    pageId: state.pageId,
    status: state.status,
    isSaving: state.isSaving,
    isPublishing: state.isPublishing,
    lastSaved: state.lastSaved,
  };
}
