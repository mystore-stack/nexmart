import type { SiteSettingsData } from "@/lib/cms/defaults";

export function DynamicTheme({ settings }: { settings: SiteSettingsData }) {
  const css = `
    :root {
      --site-primary: ${settings.primaryColor};
      --site-secondary: ${settings.secondaryColor};
      --site-accent: ${settings.accentColor || settings.primaryColor};
      --site-theme-light: ${settings.themeColorLight};
      --site-theme-dark: ${settings.themeColorDark};
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
