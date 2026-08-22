"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavigationData, NavigationItem } from "@/lib/homepage/types";

interface NavigationProps {
  data: NavigationData;
}

export function Navigation({ data }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (!data || !data.items) return null;

  const renderNavItem = (item: NavigationItem, depth = 0) => {
    const isActive = pathname === item.url;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => hasChildren && setActiveDropdown(item.id)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <Link
          href={item.url || '#'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${16 + depth * 16}px` }}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && <ChevronDown className="w-4 h-4" />}
        </Link>

        {hasChildren && activeDropdown === item.id && (
          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1">
        {data.items.map((item) => renderNavItem(item))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-bold text-lg">{data.name}</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {data.items.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.url || '#'}
                  className={`block px-4 py-3 rounded-lg ${
                    pathname === item.url ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url || '#'}
                        className={`block px-4 py-2 rounded-lg text-sm ${
                          pathname === child.url ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
