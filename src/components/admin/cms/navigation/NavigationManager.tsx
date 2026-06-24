"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Menu } from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { DragDropList } from "@/components/admin/cms/shared/DragDropList";

interface MenuItem {
  id: string;
  label: string;
  url?: string | null;
  displayOrder: number;
  isVisible: boolean;
}

interface NavMenu {
  id: string;
  name: string;
  location: string;
  items: MenuItem[];
}

export function NavigationManager() {
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState("Main Navigation");

  const fetchMenus = async () => {
    const res = await fetch("/api/admin/cms/navigation");
    const data = await res.json();
    if (data.success) setMenus(data.menus);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const createMenu = async () => {
    const res = await fetch("/api/admin/cms/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu: { name: menuName, location: "HEADER", isActive: true },
        items: [
          { label: "Home", url: "/", displayOrder: 0, isVisible: true },
          { label: "Shop", url: "/products", displayOrder: 1, isVisible: true },
          { label: "Categories", url: "/categories", displayOrder: 2, isVisible: true },
        ],
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Menu created");
      fetchMenus();
    } else toast.error(data.error);
  };

  return (
    <CmsShell
      title="Navigation Menu Builder"
      description="Build header, footer, and mobile navigation menus with drag-and-drop."
      actions={
        <button type="button" onClick={createMenu} className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> New Menu
        </button>
      }
    >
      <div className="mb-4">
        <input
          className="input max-w-xs"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          placeholder="Menu name"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading menus...</p>
      ) : menus.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Menu className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No navigation menus yet. Create your first menu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {menus.map((menu) => (
            <div key={menu.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{menu.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{menu.location.toLowerCase()}</p>
                </div>
              </div>
              <DragDropList
                items={menu.items}
                onReorder={(items) =>
                  setMenus((prev) =>
                    prev.map((m) => (m.id === menu.id ? { ...m, items } : m))
                  )
                }
                renderItem={(item) => (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.url ?? "#"}</p>
                    </div>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </CmsShell>
  );
}
