import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { HomepageData, SectionType } from "./types";

/**
 * Fetch homepage data from PostgreSQL database only.
 * Uses HomepageBuilder and HomepageSection models for dynamic sections.
 */
export async function getHomepageData(): Promise<HomepageData> {
  const organizationId = await getOptionalDefaultOrganizationId();
  
  if (!organizationId) {
    if (process.env.NODE_ENV === "development") {
      console.warn('[HOMEPAGE] No organization configured. Returning empty homepage data.');
    }
    return {
      announcementBar: null,
      hero: null,
      navigation: null,
      footer: null,
      sections: [],
      theme: null,
      visibleSections: [],
      marketingCms: {
        announcements: [],
        heroBanners: [],
        featuredCategories: [],
        flashDeals: [],
        mysteryBoxes: [],
        bundles: [],
        superDeals: [],
        brands: [],
        sponsoredProducts: [],
        testimonials: [],
        advertisements: [],
        campaigns: [],
      },
    };
  }

  // Fetch homepage builder with sections
  const builder = await (prisma as any).homepageBuilder.findFirst({
    where: { organizationId },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
        where: { isEnabled: true, publishStatus: "PUBLISHED" },
      },
    },
  });

  // Fetch core components (announcement bar, hero, navigation, footer, theme)
  const [
    announcementBar,
    professionalHero,
    navigationMenus,
    footerConfig,
    activeTheme,
  ] = await Promise.all([
    prisma.announcementBar.findFirst({
      where: { organizationId, isEnabled: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.professionalHero.findFirst({
      where: { organizationId, isEnabled: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.navigationMenu.findMany({
      where: { organizationId, isActive: true },
      include: {
        items: {
          where: { isVisible: true, isPublished: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            children: {
              where: { isVisible: true, isPublished: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { location: 'asc' },
    }),
    prisma.footerConfig.findFirst({
      where: { organizationId, isVisible: true, isPublished: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.theme.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Build sections array from homepage builder
  const sections: HomepageData['sections'] = [];
  
  if (builder && builder.sections) {
    for (const section of builder.sections) {
      sections.push({
        id: section.id,
        type: section.sectionType as SectionType,
        isEnabled: section.isEnabled,
        displayOrder: section.displayOrder,
        config: section.config,
      });
    }
  }

  // Sort sections by display order
  sections.sort((a, b) => a.displayOrder - b.displayOrder);

  // Build navigation data
  const navigation = navigationMenus.length > 0 ? {
    id: navigationMenus[0].id,
    name: navigationMenus[0].name,
    location: navigationMenus[0].location,
    items: navigationMenus[0].items.map((item: any) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      icon: item.icon,
      target: item.target,
      isVisible: item.isVisible,
      displayOrder: item.displayOrder,
      badge: item.badge,
      children: item.children?.map((child: any) => ({
        id: child.id,
        label: child.label,
        url: child.url,
        icon: child.icon,
        target: child.target,
        isVisible: child.isVisible,
        displayOrder: child.displayOrder,
        badge: child.badge,
      })),
    })),
  } : null;

  // Build footer data
  const footer = footerConfig ? {
    id: footerConfig.id,
    logoUrl: footerConfig.logoUrl,
    description: footerConfig.description,
    socialLinks: footerConfig.socialLinks as any,
    contactInfo: footerConfig.contactInfo as any,
    quickLinks: footerConfig.quickLinks as any,
    legalLinks: footerConfig.legalLinks as any,
    columns: footerConfig.columns as any,
    copyrightText: footerConfig.copyrightText,
    newsletterSettings: footerConfig.newsletterSettings as any,
    paymentIcons: footerConfig.paymentIcons as any,
    storeBadges: footerConfig.storeBadges as any,
  } : null;

  // Build theme data
  const theme = activeTheme ? {
    id: activeTheme.id,
    version: activeTheme.version,
    name: activeTheme.name,
    isActive: activeTheme.isActive,
    settings: activeTheme.settings,
    colorPalette: activeTheme.colorPalette,
    typography: activeTheme.typography,
    componentOverrides: activeTheme.componentOverrides,
    layoutSettings: activeTheme.layoutSettings,
    animations: activeTheme.animations,
    headerConfig: activeTheme.headerConfig,
    footerConfig: activeTheme.footerConfig,
    sectionStyles: activeTheme.sectionStyles,
    customCSS: activeTheme.customCSS,
    customJS: activeTheme.customJS,
  } : null;

  return {
    organizationId,
    announcementBar: announcementBar ? {
      id: announcementBar.id,
      text: announcementBar.text,
      backgroundColor: announcementBar.backgroundColor,
      textColor: announcementBar.textColor,
      link: announcementBar.link || undefined,
      linkText: announcementBar.linkText || undefined,
      icon: announcementBar.icon || undefined,
      animation: announcementBar.animation || undefined,
      autoHide: announcementBar.autoHide,
      hideAfter: announcementBar.hideAfter,
    } : null,
    hero: professionalHero ? {
      id: professionalHero.id,
      title: professionalHero.title,
      subtitle: professionalHero.subtitle,
      description: professionalHero.description,
      desktopImage: professionalHero.desktopImage,
      tabletImage: professionalHero.tabletImage,
      mobileImage: professionalHero.mobileImage,
      videoUrl: professionalHero.videoUrl,
      gradient: professionalHero.gradient,
      animatedBackground: professionalHero.animatedBackground,
      floatingCards: professionalHero.floatingCards as any,
      countdownEnabled: professionalHero.countdownEnabled,
      countdownEnd: professionalHero.countdownEnd,
      ctaButtons: professionalHero.ctaButtons as any,
      badge: professionalHero.badge as any,
      discount: professionalHero.discount as any,
      featuredProductId: professionalHero.featuredProductId,
      sponsorLogo: professionalHero.sponsorLogo,
      sponsorLink: professionalHero.sponsorLink,
      backgroundColor: professionalHero.backgroundColor,
      textColor: professionalHero.textColor,
      overlayOpacity: professionalHero.overlayOpacity,
      heroHeight: professionalHero.heroHeight,
      heroPosition: professionalHero.heroPosition,
    } : null,
    navigation,
    footer: footerConfig ? {
      id: footerConfig.id,
      logoUrl: footerConfig.logoUrl || undefined,
      description: footerConfig.description || undefined,
      socialLinks: footerConfig.socialLinks as any,
      contactInfo: footerConfig.contactInfo as any,
      quickLinks: footerConfig.quickLinks as any,
      legalLinks: footerConfig.legalLinks as any,
      columns: footerConfig.columns as any,
      copyrightText: footerConfig.copyrightText || undefined,
      newsletterSettings: footerConfig.newsletterSettings as any,
      paymentIcons: footerConfig.paymentIcons as any,
      storeBadges: footerConfig.storeBadges as any,
    } : null,
    sections,
    theme: activeTheme ? {
      id: activeTheme.id,
      version: activeTheme.version,
      name: activeTheme.name,
      isActive: activeTheme.isActive,
      settings: activeTheme.settings,
      colorPalette: activeTheme.colorPalette,
      typography: activeTheme.typography,
      componentOverrides: activeTheme.componentOverrides,
      layoutSettings: activeTheme.layoutSettings,
      animations: activeTheme.animations,
      headerConfig: activeTheme.headerConfig,
      footerConfig: activeTheme.footerConfig,
      sectionStyles: activeTheme.sectionStyles,
      customCSS: activeTheme.customCSS || undefined,
      customJS: activeTheme.customJS || undefined,
    } : null,
    visibleSections: sections.filter(s => s.isEnabled).map(s => s.type),
    marketingCms: {
      announcements: [],
      heroBanners: [],
      featuredCategories: [],
      flashDeals: [],
      mysteryBoxes: [],
      bundles: [],
      superDeals: [],
      brands: [],
      sponsoredProducts: [],
      testimonials: [],
      advertisements: [],
      campaigns: [],
    },
  };
}

/**
 * Revalidate homepage cache when sections are updated
 */
export async function revalidateHomepage() {
  // This will be called by admin actions to trigger cache revalidation
  // Implementation depends on your caching strategy
}
