"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";

export function GenericJsonEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [configStr, setConfigStr] = useState(JSON.stringify(parsedConfig, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(configStr);
      startTransition(async () => {
        await updateSectionConfig(section.id, parsed);
        router.refresh();
      });
    } catch (e) {
      alert("Invalid JSON config");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">JSON Configuration (Generic Fallback)</h3>
        <textarea
          className="w-full h-64 font-mono text-sm border rounded-lg p-4"
          value={configStr}
          onChange={(e) => setConfigStr(e.target.value)}
        />
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Generic Configuration"}
        </button>
      </div>
    </div>
  );
}
