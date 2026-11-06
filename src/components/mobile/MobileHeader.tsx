"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  ShoppingCart,
  Menu,
  Search,
  Camera,
  MapPin,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/index";
import { NexmartEmblem } from "@/components/ui/NexmartLogo";

interface AddressData {
  id: string;
  name: string;
  city: string;
  line1: string;
  isDefault: boolean;
}

export function MobileHeader() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressData | null>(null);
  const [isRtl, setIsRtl] = useState(false);

  const { items, openCart } = useCartStore();
  const { toggleMobileMenu } = useUIStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Scroll listener for subtle header elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // RTL detection
  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsRtl(document.documentElement.dir === "rtl" || document.documentElement.lang?.startsWith("ar"));
    }
  }, []);

  // Fetch real notifications unread count if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/notifications", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  // Fetch real delivery address if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/auth/addresses", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const def = res.data.find((a: AddressData) => a.isDefault) || res.data[0];
            setDeliveryAddress(def);
          }
        })
        .catch(() => {});
    } else {
      setDeliveryAddress(null);
    }
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <header
      id="nm-mobile-header"
      className={`fixed top-0 inset-x-0 z-50 bg-white transition-all duration-200 ${
        scrolled
          ? "shadow-[0_4px_20px_rgba(12,31,27,0.06)] border-b border-[#E8EDEB]"
          : "border-b border-[#F0F3F1]"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-md mx-auto px-3.5 pt-2 pb-2.5 flex flex-col gap-2">
        {/* ─── ROW 1: BRAND LOGO & ACTION ICONS ─────────────────────────── */}
        <div className="flex items-center justify-between h-[42px]">
          {/* Brand Logo (Left) */}
          <Link
            href="/"
            className="flex items-center gap-2 select-none group active:scale-95 transition-transform"
            aria-label="NexMart Accueil"
          >
            <NexmartEmblem size={30} color="#0B6B57" />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-extrabold text-[1.18rem] tracking-tight text-[#0C1F1B] font-sans">
                nexmart
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-[#0B6B57] uppercase -mt-0.5">
                Maroc
              </span>
            </div>
          </Link>

          {/* Action Icons (Right) */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Link
              href="/account/notifications"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#0C1F1B] hover:bg-[#F3F6F4] active:bg-[#E8EDEB] transition-colors"
              aria-label={isRtl ? "الإشعارات" : "Notifications"}
            >
              <Bell size={21} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444] border-2 border-white" />
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <button
              onClick={openCart}
              type="button"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#0C1F1B] hover:bg-[#F3F6F4] active:bg-[#E8EDEB] transition-colors"
              aria-label={isRtl ? `السلة (${cartCount})` : `Panier (${cartCount})`}
            >
              <ShoppingCart size={21} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0B6B57] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-75">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Menu Drawer */}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#0C1F1B] hover:bg-[#F3F6F4] active:bg-[#E8EDEB] transition-colors"
              aria-label={isRtl ? "القائمة" : "Menu"}
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ─── ROW 2: FULL-WIDTH ROUNDED SEARCH BAR ─────────────────────── */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center w-full h-[44px] rounded-full bg-[#F3F6F4] border border-[#E8EDEB] focus-within:border-[#0B6B57] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B6B57]/15 transition-all shadow-[inset_0_1px_2px_rgba(12,31,27,0.03)]">
            {/* Search Icon */}
            <span className="pl-3.5 pr-2.5 text-[#7A9E97] flex items-center pointer-events-none">
              <Search size={18} strokeWidth={2.2} />
            </span>

            {/* Input Field */}
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "البحث عن منتج..." : "Rechercher un produit..."}
              className="flex-1 h-full bg-transparent text-[#0C1F1B] text-[14px] placeholder-[#7A9E97] outline-none font-sans font-medium"
            />

            {/* Clear Button (if query typed) */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A9E97] hover:text-[#0C1F1B] transition-colors"
                aria-label="Effacer"
              >
                <X size={15} />
              </button>
            )}

            {/* Camera / Scan Shortcut (operational via Phase 4 /scan) */}
            <Link
              href="/scan"
              className="mr-1.5 w-8 h-8 rounded-full bg-white border border-[#D6DDD9] flex items-center justify-center text-[#0B6B57] hover:bg-[#0B6B57] hover:text-white transition-colors shadow-xs active:scale-90"
              aria-label={isRtl ? "مسح الباركود" : "Scanner un code"}
            >
              <Camera size={16} strokeWidth={2.2} />
            </Link>
          </div>
        </form>

        {/* ─── ROW 3: DELIVERY LOCATION (AUTHENTIC ONLY) ─────────────────── */}
        {deliveryAddress && (
          <Link
            href="/account/addresses"
            className="flex items-center justify-between px-2 py-1 -mt-0.5 rounded-lg text-[11px] text-[#3D5A54] hover:bg-[#F3F6F4] transition-colors"
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={13} className="text-[#0B6B57] shrink-0" strokeWidth={2.4} />
              <span className="text-[#7A9E97] font-medium shrink-0">
                {isRtl ? "التوصيل إلى:" : "Livrer à :"}
              </span>
              <span className="font-bold text-[#0C1F1B] truncate">
                {deliveryAddress.city} {deliveryAddress.line1 ? `— ${deliveryAddress.line1}` : ""}
              </span>
            </div>
            {isRtl ? (
              <ChevronLeft size={13} className="text-[#7A9E97] shrink-0" />
            ) : (
              <ChevronRight size={13} className="text-[#7A9E97] shrink-0" />
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
