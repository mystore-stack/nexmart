"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";

export function MobileAppBannerEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig.mobileAppBanner || {
    title: "Download Our App",
    subtitle: "Get exclusive mobile-only deals and early access to sales.",
    appStoreUrl: "",
    googlePlayUrl: "",
    desktopImage: "",
    mobileImage: "",
    qrCodeImage: "",
  });

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, { ...parsedConfig, mobileAppBanner: config });
      router.refresh();
    });
  };

  const updateField = (field: string, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Mobile App Banner</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 font-medium">Title</label>
          <input 
            type="text" 
            value={config.title || ""} 
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Subtitle</label>
          <input 
            type="text" 
            value={config.subtitle || ""} 
            onChange={(e) => updateField("subtitle", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">App Store Link</label>
          <input 
            type="text" 
            value={config.appStoreUrl || ""} 
            onChange={(e) => updateField("appStoreUrl", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Google Play Link</label>
          <input 
            type="text" 
            value={config.googlePlayUrl || ""} 
            onChange={(e) => updateField("googlePlayUrl", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Desktop Image URL</label>
          <input 
            type="text" 
            value={config.desktopImage || ""} 
            onChange={(e) => updateField("desktopImage", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Mobile Image URL</label>
          <input 
            type="text" 
            value={config.mobileImage || ""} 
            onChange={(e) => updateField("mobileImage", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">QR Code Image URL (Optional)</label>
          <input 
            type="text" 
            value={config.qrCodeImage || ""} 
            onChange={(e) => updateField("qrCodeImage", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
