# Page Builder

Enterprise-grade Page Builder component for creating and managing dynamic page layouts with sections.

## Features

- **Section Library**: 23 pre-built section types with search, filtering, and categorization
- **Visual Editor**: Live preview with real-time configuration updates
- **Drag & Drop**: Intuitive section reordering with visual feedback
- **Undo/Redo**: Full history management with 50-step stack
- **Auto-Save**: Debounced auto-save with unsaved changes indicator
- **Preview Modes**: Desktop (1920px), Laptop (1366px), Tablet (768px), Mobile (375px)
- **Section Settings**: Tabbed interface for Content, Style, and Layout configuration
- **Favorites & Recently Used**: Persistent user preferences via localStorage
- **Accessibility**: Full keyboard navigation, ARIA labels, and semantic HTML

## Installation

The Page Builder is already integrated into the application. Import it from:

```tsx
import { PageBuilder } from "@/components/page-builder";
```

## Basic Usage

```tsx
import { PageBuilder } from "@/components/page-builder";
import type { PageSection } from "@/components/page-builder/types";

function MyPage() {
  const [sections, setSections] = useState<PageSection[]>([]);

  const handleSave = async () => {
    // Save sections to your backend
    await savePage(sections);
  };

  return (
    <PageBuilder
      sections={sections}
      onSectionsChange={setSections}
      onSave={handleSave}
      enableAutoSave={true}
      enableUndoRedo={true}
      enableDragDrop={true}
    />
  );
}
```

## Props

### PageBuilder

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sections` | `PageSection[]` | required | Array of page sections |
| `onSectionsChange` | `(sections: PageSection[]) => void` | required | Callback when sections change |
| `onSave` | `() => Promise<void> \| void` | optional | Save handler for auto-save |
| `enableAutoSave` | `boolean` | `true` | Enable debounced auto-save |
| `enableUndoRedo` | `boolean` | `true` | Enable undo/redo functionality |
| `enableDragDrop` | `boolean` | `true` | Enable drag-and-drop reordering |

## Section Types

The Page Builder includes 23 pre-built section types:

### Content Sections
- **HeroSection**: Full-width hero with background, title, subtitle, and CTAs
- **RichTextSection**: Rich text content with HTML support
- **TextBlockSection**: Simple text block with styling options
- **CTASection**: Call-to-action banner with buttons
- **CTABannerSection**: Promotional banner with overlay

### Product Sections
- **ProductGridSection**: Grid of products with filtering
- **ProductCarouselSection**: Horizontal product carousel
- **FeaturedProductsSection**: Highlighted featured products

### Category Sections
- **FeaturedCategoriesSection**: Category grid with images
- **BrandLogosSection**: Brand/logo display grid

### Marketing Sections
- **TestimonialsSection**: Customer testimonials with avatars
- **BenefitsSection**: Feature benefits with icons
- **FAQSection**: Accordion-style FAQ section
- **NewsletterSection**: Email subscription form
- **PromotionalBannerSection**: Promotional banner with countdown

### Media Sections
- **ImageGallerySection**: Image gallery with lightbox
- **VideoSection**: Video embed with custom styling

### Utility Sections
- **CountdownTimerSection**: Countdown timer for events
- **CustomHTMLSection**: Custom HTML content (use with caution)
- **SpacerSection**: Vertical spacing between sections

## Section Configuration

Each section has a `config` object that follows the `SectionConfig` interface:

```typescript
interface SectionConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  borderRadius?: string;
  shadow?: string;
  textAlign?: "left" | "center" | "right";
  spacing?: "small" | "medium" | "large";
  padding?: string;
  margin?: string;
  visibility?: "all" | "desktop" | "mobile" | "tablet";
  customCssClasses?: string;
  animation?: string;
  // ... section-specific properties
}
```

## Hooks

### useSectionInsert

Manages section insertion logic with automatic focusing and settings panel opening.

```tsx
const { insertPosition, openLibraryAt, closeLibrary, insertSection } = useSectionInsert({
  onSectionInsert: (newSection, position) => {
    // Handle section insertion
  },
  onSectionFocus: (sectionId) => {
    // Focus on the inserted section
  },
  onSettingsOpen: (sectionId) => {
    // Open settings panel for the section
  },
});
```

### useSectionLibrary

Manages favorites and recently used sections with localStorage persistence.

```tsx
const { favorites, recentlyUsed, toggleFavorite, addToRecentlyUsed, isFavorite } = useSectionLibrary();
```

### useDragAndDrop

Provides visual drag-and-drop functionality for reordering items.

```tsx
const { dragState, getDraggableProps } = useDragAndDrop<PageSection>({
  items: sections,
  onReorder: onSectionsChange,
});
```

### useHistory

Implements undo/redo functionality with configurable history stack.

```tsx
const { state, setState, undo, redo, canUndo, canRedo } = useHistory<PageSection[]>(
  sections,
  { maxHistory: 50 }
);
```

### useAutoSave

Implements debounced auto-save with unsaved changes tracking.

```tsx
const { saveStatus, hasUnsavedChanges, saveNow, isSaving } = useAutoSave<PageSection[]>({
  data: sections,
  onSave: async (data) => {
    await savePage(data);
  },
  debounceMs: 2000,
  enabled: true,
});
```

## Custom Sections

To add a custom section:

1. Create your section component in `src/components/page-builder/sections/`:

```tsx
// MyCustomSection.tsx
import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface MyCustomSectionProps {
  section: PageSection;
}

export function MyCustomSection({ section }: MyCustomSectionProps) {
  const config = section.config as SectionConfig & { customProp?: string };

  return (
    <div className="py-12 px-4">
      <h1>{config.title}</h1>
      {/* Your custom content */}
    </div>
  );
}
```

2. Register your section in `src/components/page-builder/library/section-library.ts`:

```typescript
import { MyCustomSection } from "../sections/MyCustomSection";

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  // ... existing sections
  {
    id: "my-custom",
    name: "My Custom Section",
    description: "A custom section for specific needs",
    icon: "Star",
    category: "custom",
    component: MyCustomSection,
    defaultConfig: {
      title: "Custom Section",
      backgroundColor: "#FFFFFF",
    },
  },
];
```

## Security Considerations

### dangerouslySetInnerHTML

The following sections use `dangerouslySetInnerHTML` and should be used with caution:

- **RichTextSection**: Renders HTML content
- **CustomHTMLSection**: Renders custom HTML

**Recommendation**: In production, sanitize HTML content using a library like DOMPurify:

```tsx
import DOMPurify from 'dompurify';

dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(config.content) }}
```

### Input Validation

All user inputs in the Section Settings Panel should be validated before saving to prevent injection attacks.

## Performance Optimization

### Memoization

Key components are memoized to prevent unnecessary re-renders:
- `SectionCard` - Wrapped in `React.memo`
- `SectionLibraryModal` - Wrapped in `React.memo`
- `SectionSettingsPanel` - Wrapped in `React.memo`

### Debouncing

Auto-save uses a 2-second debounce to prevent excessive save operations.

### Lazy Loading

Consider implementing lazy loading for section components if the library grows significantly.

## Accessibility

The Page Builder follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Buttons and inputs have descriptive ARIA labels
- **Semantic HTML**: Proper use of semantic elements
- **Focus Management**: Logical focus flow and visible focus indicators
- **Screen Reader Support**: Compatible with screen readers

### Keyboard Shortcuts

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and cards
- **Escape**: Close modals

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Sections not rendering

Ensure that:
1. The section is registered in `section-library.ts`
2. The section component is exported correctly
3. The section type matches the `sectionType` in `PageSection`

### Drag and drop not working

Check that:
1. `enableDragDrop` prop is set to `true`
2. The sections array is properly managed
3. No conflicting event handlers are attached

### Auto-save not triggering

Verify:
1. `enableAutoSave` prop is set to `true`
2. `onSave` callback is provided
3. The debounce delay (default 2000ms) has elapsed

## Contributing

When adding new features:

1. Maintain TypeScript strict typing
2. Add accessibility attributes
3. Include empty states for better UX
4. Update this README with new sections
5. Test across all preview modes

## License

This component is part of the Nexmart Moroccan Luxury application.
