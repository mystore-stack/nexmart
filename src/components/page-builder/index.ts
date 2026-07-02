// Core types
export type {
  SectionConfig,
  HeroSectionConfig,
  ProductSectionConfig,
  Product,
  ButtonConfig,
  Category,
  Testimonial,
  FAQ,
  IconItem,
  Brand,
  GalleryImage,
  PageSection,
} from "./types";

// Core components
export { PageSectionRenderer } from "./PageSectionRenderer";

// Complete Page Builder
export { PageBuilder } from "./PageBuilder";

// Preview Modes
export { PreviewModes, PreviewContainer } from "./PreviewModes";
export type { PreviewMode } from "./PreviewModes";

// Enterprise Hooks
export { useDragAndDrop, useHistory, useAutoSave } from "./hooks";

// Section Library
export {
  SECTION_DEFINITIONS,
  SECTION_CATEGORIES,
  type SectionCategory,
  type SectionDefinition,
  getSectionById,
  getSectionsByCategory,
  searchSections,
  filterSections,
  SectionCard,
  SectionLibraryModal,
  AddSectionButton,
  useSectionLibrary,
  useSectionInsert,
  PageBuilderExample,
} from "./library";

// Settings Panel
export {
  FormField,
  TextInput,
  TextArea,
  ColorPicker,
  Select,
  Slider,
  Toggle,
  ImageUpload,
  ButtonConfig as ButtonConfigField,
  SectionSettingsPanel,
} from "./settings";

// Block Templates
export type { BlockTemplate, BlockTemplateCategory } from "./templates";
export { useBlockTemplates } from "./templates";
