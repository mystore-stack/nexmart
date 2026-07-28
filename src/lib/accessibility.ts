// src/lib/accessibility.ts - WCAG 2.1 AA compliance utilities

/**
 * WCAG 2.1 AA Compliance Checklist:
 * 1. Perceivable - content must be perceivable
 * 2. Operable - interface must be operable
 * 3. Understandable - content must be understandable
 * 4. Robust - must work with assistive technologies
 */

/**
 * Color contrast ratios for WCAG AA compliance
 * AA requires 4.5:1 for normal text, 3:1 for large text
 */
export const contrastRatios = {
  AA_NORMAL: 4.5, // Normal text
  AA_LARGE: 3, // Large text (18px+ or 14px+ bold)
  AAA_NORMAL: 7, // Enhanced contrast
  AAA_LARGE: 4.5,
} as const;

/**
 * ARIA roles and attributes
 */
export const ariaRoles = {
  // Landmarks
  navigation: "navigation",
  main: "main",
  complementary: "complementary",
  contentinfo: "contentinfo",

  // Interactive
  button: "button",
  link: "link",
  searchbox: "searchbox",
  menuitem: "menuitem",
  tab: "tab",

  // Status
  status: "status",
  alert: "alert",
  alertdialog: "alertdialog",
  progressbar: "progressbar",

  // Structure
  list: "list",
  listitem: "listitem",
  group: "group",
  region: "region",
} as const;

/**
 * Semantic HTML checklist
 * - Use <button> for interactive elements
 * - Use <a> for navigation
 * - Use <header>, <nav>, <main>, <section>, <article>, <footer>
 * - Use <h1>-<h6> for headings (in order)
 * - Use <form>, <label>, <input>, <textarea>, <select>
 * - Use <table>, <thead>, <tbody>, <th>, <td>
 * - Use <ul>, <ol>, <li>
 * - Use <img alt="...">
 * - Use <video>, <audio> with captions/transcripts
 */

/**
 * Focus management
 */
export const focusManagement = {
  // Focus visible styles for keyboard navigation
  focusVisible: {
    outlineWidth: "2px",
    outlineColor: "hsl(var(--ring))",
    outlineOffset: "2px",
  },

  // Focus trap for modals/dialogs
  focusTrap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    return {
      first: firstElement,
      last: lastElement,
    };
  },
};

/**
 * Skip links for keyboard navigation
 */
export const skipLinkHTML = `
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
`;

/**
 * Skip link CSS
 */
export const skipLinkCSS = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: hsl(var(--primary));
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
`;

/**
 * Heading hierarchy validator
 */
export function validateHeadingHierarchy(html: string): {
  valid: boolean;
  errors: string[];
} {
  const headings = html.match(/<h[1-6][^>]*>/g) || [];
  const errors: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading[2]);

    // Check for h1 as first heading
    if (index === 0 && level !== 1) {
      errors.push("First heading should be h1");
    }

    // Check for proper hierarchy
    if (level > previousLevel + 1) {
      errors.push(`Skipped heading level at position ${index}: h${previousLevel} to h${level}`);
    }

    previousLevel = level;
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Color blindness simulation values
 */
export const colorBlindnessSimulation = {
  protanopia: "hsl-rotate(0deg)", // Red-blind
  deuteranopia: "hsl-rotate(120deg)", // Green-blind
  tritanopia: "hsl-rotate(240deg)", // Blue-blind
  achromatopsia: "saturate(0%)", // Total color blindness
} as const;

/**
 * Screen reader announcements
 */
export const screenReaderAnnouncements = {
  loadingComplete: "Content loaded",
  errorOccurred: "An error occurred",
  itemAdded: "Item added to cart",
  itemRemoved: "Item removed",
  filterApplied: "Filters applied",
  resultsUpdated: "Results updated",
};

/**
 * ARIA live region utilities
 */
export function createAriaLiveRegion(
  message: string,
  polite: "polite" | "assertive" = "polite"
): HTMLDivElement {
  const region = document.createElement("div");
  region.setAttribute("aria-live", polite);
  region.setAttribute("aria-atomic", "true");
  region.className = "sr-only"; // Screen reader only
  region.textContent = message;
  return region;
}

/**
 * Form accessibility utilities
 */
export const formAccessibility = {
  // Label association
  associateLabel: (labelElement: HTMLLabelElement, inputId: string) => {
    labelElement.setAttribute("for", inputId);
  },

  // Error association
  associateError: (inputElement: HTMLInputElement, errorId: string) => {
    const ariaDescribedBy = inputElement.getAttribute("aria-describedby") || "";
    inputElement.setAttribute("aria-describedby", `${ariaDescribedBy} ${errorId}`.trim());
  },

  // Required field indication
  markRequired: (inputElement: HTMLInputElement) => {
    inputElement.setAttribute("aria-required", "true");
    inputElement.required = true;
  },
};

/**
 * Keyboard shortcuts documentation
 */
export const keyboardShortcuts = {
  focusSearch: "Cmd+K / Ctrl+K",
  goHome: "Cmd+/ / Ctrl+/",
  goCart: "Cmd+L / Ctrl+L",
  skipToContent: "Tab",
  closeModal: "Escape",
  toggleMenu: "Cmd+M / Ctrl+M",
};
