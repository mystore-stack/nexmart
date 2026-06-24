"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Globe, Mail, Phone, Palette, Search, Share2 } from "lucide-react";
import { CmsHero } from "@/components/admin/cms/shared/CmsHero";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { updateSiteSettings } from "@/lib/cms/actions/settings";
import type { SiteSettingsData } from "@/lib/cms/defaults";

type Tab = "general" | "contact" | "seo" | "theme" | "social";

export function SiteSettingsManager({ initial }: { initial: SiteSettingsData | null }) {
  const [form, setForm] = useState<SiteSettingsData | null>(initial);
  const [tab, setTab] = useState<Tab>("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  if (!form) {
    return (
      <CmsShell title="Paramètres du site" description="Chargement...">
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </CmsShell>
    );
  }

  const set = <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSiteSettings(form);
    setSaving(false);
    if (result.success) {
      toast.success("Paramètres enregistrés — site mis à jour en direct");
    } else {
      toast.error(result.error);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "general", label: "Général", icon: Globe },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "seo", label: "SEO", icon: Search },
    { id: "theme", label: "Thème", icon: Palette },
    { id: "social", label: "Réseaux", icon: Share2 },
  ];

  return (
    <CmsShell
      title="Paramètres du site"
      description="Logo, contact, SEO, couleurs — synchronisés instantanément avec le site public."
      actions={
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm">
          <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer et publier"}
        </button>
      }
    >
      <div className="mb-6 space-y-6">
        <CmsHero variant="compact" showCta={false} />
      </div>
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {tab === "general" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom de la boutique" value={form.storeName} onChange={(v) => set("storeName", v)} />
              <Field label="Slogan" value={form.storeTagline ?? ""} onChange={(v) => set("storeTagline", v || null)} />
              <Field label="URL du logo" value={form.logoUrl ?? ""} onChange={(v) => set("logoUrl", v || null)} />
              <Field label="URL du favicon" value={form.faviconUrl ?? ""} onChange={(v) => set("faviconUrl", v || null)} />
              <Field label="Devise" value={form.currency} onChange={(v) => set("currency", v)} />
              <Field label="Placeholder recherche" value={form.searchPlaceholder ?? ""} onChange={(v) => set("searchPlaceholder", v || null)} />
            </div>
            <Field label="Message livraison gratuite" value={form.freeShippingMessage ?? ""} onChange={(v) => set("freeShippingMessage", v || null)} />
            <Field label="Texte copyright" value={form.copyrightText ?? ""} onChange={(v) => set("copyrightText", v || null)} />
          </>
        )}

        {tab === "contact" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" value={form.email ?? ""} onChange={(v) => set("email", v || null)} type="email" />
            <Field label="Email support" value={form.supportEmail ?? ""} onChange={(v) => set("supportEmail", v || null)} type="email" />
            <Field label="Téléphone" value={form.phone ?? ""} onChange={(v) => set("phone", v || null)} />
            <Field label="WhatsApp (indicatif pays)" value={form.whatsapp ?? ""} onChange={(v) => set("whatsapp", v || null)} />
            <Field label="Adresse" value={form.address ?? ""} onChange={(v) => set("address", v || null)} className="sm:col-span-2" />
            <Field label="Horaires d'ouverture" value={form.businessHours ?? ""} onChange={(v) => set("businessHours", v || null)} className="sm:col-span-2" />
          </div>
        )}

        {tab === "seo" && (
          <>
            <Field label="Titre SEO" value={form.seoTitle ?? ""} onChange={(v) => set("seoTitle", v || null)} />
            <div>
              <label className="mb-1 block text-sm font-medium">Description SEO</label>
              <textarea className="input w-full min-h-[80px]" value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value || null)} />
            </div>
            <Field label="URL du site" value={form.siteUrl ?? ""} onChange={(v) => set("siteUrl", v || null)} />
            <Field label="Image OG (réseaux sociaux)" value={form.ogImageUrl ?? ""} onChange={(v) => set("ogImageUrl", v || null)} />
            <Field label="Compte Twitter" value={form.twitterHandle ?? ""} onChange={(v) => set("twitterHandle", v || null)} />
            <Field label="Mots-clés (séparés par des virgules)" value={form.seoKeywords.join(", ")} onChange={(v) => set("seoKeywords", v.split(",").map((s) => s.trim()).filter(Boolean))} />
          </>
        )}

        {tab === "theme" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Couleur principale" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
            <ColorField label="Couleur secondaire" value={form.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
            <ColorField label="Couleur d'accent" value={form.accentColor ?? "#14b8a6"} onChange={(v) => set("accentColor", v || null)} />
            <ColorField label="Thème clair" value={form.themeColorLight} onChange={(v) => set("themeColorLight", v)} />
            <ColorField label="Thème sombre" value={form.themeColorDark} onChange={(v) => set("themeColorDark", v)} />
          </div>
        )}

        {tab === "social" && (
          <div className="space-y-3">
            {form.socialLinks.map((link, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <input className="input" placeholder="Plateforme" value={link.platform} onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[i] = { ...next[i], platform: e.target.value };
                  set("socialLinks", next);
                }} />
                <input className="input sm:col-span-2" placeholder="URL" value={link.url} onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[i] = { ...next[i], url: e.target.value };
                  set("socialLinks", next);
                }} />
              </div>
            ))}
            <button type="button" className="text-sm text-primary hover:underline" onClick={() => set("socialLinks", [...form.socialLinks, { platform: "", url: "" }])}>
              + Ajouter un réseau social
            </button>
          </div>
        )}
      </div>
    </CmsShell>
  );
}

function Field({ label, value, onChange, type = "text", className = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input type={type} className="input w-full" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <input type="color" className="h-10 w-14 cursor-pointer rounded border border-border" value={value} onChange={(e) => onChange(e.target.value)} />
        <input className="input flex-1 font-mono text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
