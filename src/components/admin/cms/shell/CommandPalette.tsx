"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/admin/cms/shell/cmdk";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  LayoutTemplate,
  BellRing,
  PanelBottom,
  FolderOpen,
  Menu,
  Award,
  Megaphone,
  BarChart3,
  Settings,
  Search,
  Plus,
  Save,
} from "lucide-react";
import { CMS_MODULES } from "@/lib/cms/constants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  LayoutTemplate,
  BellRing,
  PanelBottom,
  FolderOpen,
  Menu,
  Award,
  Megaphone,
  BarChart3,
};

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="border-b border-border px-3 py-2">
        <CommandInput placeholder="Search CMS modules, actions..." className="h-10" />
      </div>
      <CommandList className="max-h-[400px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="CMS Modules">
          {CMS_MODULES.map((mod) => {
            const Icon = ICON_MAP[mod.icon] ?? LayoutTemplate;
            return (
              <CommandItem key={mod.id} onSelect={() => navigate(mod.href)}>
                <Icon className="mr-2 h-4 w-4" />
                {mod.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate("/admin/cms/hero?action=new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Hero Banner
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/cms/homepage")}>
            <Save className="mr-2 h-4 w-4" />
            Open Homepage Builder
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/cms/media")}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Upload Media
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Admin">
          <CommandItem onSelect={() => navigate("/admin")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/audit")}>
            <Search className="mr-2 h-4 w-4" />
            Audit Log
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);
  return { open, setOpen };
}
