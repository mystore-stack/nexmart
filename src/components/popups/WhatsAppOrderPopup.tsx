"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, ShoppingBag, Truck, HelpCircle } from "lucide-react";
import { getPopupSettings } from "@/lib/popup-settings";

export function WhatsAppOrderPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(getPopupSettings().whatsapp);

  useEffect(() => {
    const sync = () => setConfig(getPopupSettings().whatsapp);
    sync();
    window.addEventListener("nexmart_popup_settings_updated", sync);
    return () => window.removeEventListener("nexmart_popup_settings_updated", sync);
  }, []);

  const handleOpenChat = (message: string) => {
    const rawPhone = (config.phoneNumber || "212600000000").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${rawPhone}?text=${encoded}`;
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("NexmartApp")) {
      window.location.href = `whatsapp://send?phone=${rawPhone}&text=${encoded}`;
    } else {
      window.open(url, "_blank");
    }
    setIsOpen(false);
  };

  if (!config.enabled) return null;

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-5 z-[80] flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition"
            aria-label="WhatsApp Support"
          >
            {/* Ping animation ring */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
            </span>

            {/* WhatsApp Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.185 1.564 5.939l-1.564 5.717 5.86-1.537c1.701.928 3.652 1.461 5.72 1.461 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="font-bold text-xs tracking-wide">طلب سريع عبر WhatsApp</span>
          </button>
        )}

        {/* Support Chat Drawer */}
        {isOpen && (
          <div className="w-80 overflow-hidden rounded-3xl bg-[#021A17] border border-[#064E3B] text-white shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#128C7E] to-[#075E54] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                    NX
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">فريق خدمة الزبناء</h4>
                  <p className="text-[11px] text-emerald-200">متصل الآن • En ligne</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3">
              <div className="p-3 rounded-2xl rounded-tl-sm bg-[#06332E] text-xs text-slate-200 leading-relaxed border border-[#0A4D45]">
                👋 مرحباً بيك في Nexmart! كفاش نقدرو نعاونوك اليوم؟ اختار خيار للمحادثة الفورية:
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() =>
                    handleOpenChat("السلام عليكم، بغيت ندير طلبية ديال شي منتوج عافاك.")
                  }
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#032521] hover:bg-[#064E3B] border border-[#0A4D45] text-xs font-semibold text-slate-200 transition text-right justify-start"
                >
                  <ShoppingBag className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>بغيت ندير كوموند مباشرة</span>
                </button>

                <button
                  onClick={() =>
                    handleOpenChat("السلام عليكم، بغيت نتتبع وضعية الطلبية ديالي.")
                  }
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#032521] hover:bg-[#064E3B] border border-[#0A4D45] text-xs font-semibold text-slate-200 transition text-right justify-start"
                >
                  <Truck className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>تتبع وضعية الطلبية ديالي</span>
                </button>

                <button
                  onClick={() =>
                    handleOpenChat("السلام عليكم، عندي استفسار بخصوص المنتوجات والتوصيل.")
                  }
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#032521] hover:bg-[#064E3B] border border-[#0A4D45] text-xs font-semibold text-slate-200 transition text-right justify-start"
                >
                  <HelpCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>استفسار عام أو مساعدة</span>
                </button>
              </div>
            </div>

            {/* Bottom Input Preview */}
            <div className="p-3 bg-black/40 border-t border-[#064E3B] flex items-center justify-between text-[11px] text-slate-400">
              <span>الدفع عند الاستلام مضمون 100%</span>
              <span className="text-[#25D366] font-semibold">رد سريع خلال دقائق</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
