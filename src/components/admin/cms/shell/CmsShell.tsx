"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CMS_MODULES } from "@/lib/cms/constants";
import {
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
  ChevronRight,
  Command,
} from "lucide-react";
import { CommandPalette, useCommandPalette } from "./CommandPalette";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Settings,
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

interface CmsShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function CmsShell({ title, description, actions, children }: CmsShellProps) {
  const pathname = usePathname();
  const { open, setOpen } = useCommandPalette();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/50 lg:block">
        <div className="sticky top-0 p-4">
          <div className="mb-4">
            <Link href="/admin/cms" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
              Gestion de contenu
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mb-4 flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Command className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          <nav className="space-y-0.5">
            {CMS_MODULES.map((mod) => {
              const Icon = ICON_MAP[mod.icon] ?? LayoutTemplate;
              const active = pathname === mod.href || pathname.startsWith(`${mod.href}/`);

              return (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {mod.label}
                  {active && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-border bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
