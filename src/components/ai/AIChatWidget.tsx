"use client";
/**
 * AIChatWidget — NexBot Moroccan Luxury AI Chat
 * Premium Moroccan design with full streaming support
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "Où est ma commande ? 📦",
  "Politique de retour",
  "Modes de paiement",
  "Livraison Maroc",
];

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! 👋 Je suis **NexBot**, votre assistant IA NexMart.\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const productSlug = pathname.startsWith("/products/")
    ? pathname.split("/products/")[1]?.split("?")[0]
    : undefined;

  useEffect(() => {
    const stored = window.localStorage.getItem("nexmart_ai_conversation_id");
    if (!stored) return;
    setConversationId(stored);
    fetch(`/api/ai/chat?conversationId=${stored}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.messages) || data.messages.length === 0) return;
        setMessages((prev) => [
          prev[0],
          ...data.messages.map((m: any) => ({ id: m.id, role: m.role, content: m.content, timestamp: new Date(m.createdAt) })),
        ]);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);

  useEffect(() => {
    if (open) { scrollToBottom(); setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open, scrollToBottom]);

  useEffect(() => { if (open) scrollToBottom(); }, [messages, open, scrollToBottom]);

  const sendMessage = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;
    setInput("");
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: userMessage, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.filter((m) => m.id !== "welcome").slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: userMessage, history, context: { productSlug } }),
      });
      if (!(res.headers.get("Content-Type") || "").includes("text/event-stream")) {
        const data = await res.json();
        const botMsg: Message = { id: `bot-${Date.now()}`, role: "assistant", content: data.message || data.error || "Désolé, une erreur est survenue.", timestamp: new Date() };
        if (data.conversationId) { setConversationId(data.conversationId); window.localStorage.setItem("nexmart_ai_conversation_id", data.conversationId); }
        setMessages((prev) => [...prev, botMsg]);
        if (!open) setUnread((n) => n + 1);
        return;
      }
      const streamedId = `bot-${Date.now()}`;
      setMessages((prev) => [...prev, { id: streamedId, role: "assistant", content: "", timestamp: new Date() }]);
      await readAssistantStream(res, {
        onConversationId: (id) => { setConversationId(id); window.localStorage.setItem("nexmart_ai_conversation_id", id); },
        onDelta: (delta) => { setMessages((prev) => prev.map((msg) => msg.id === streamedId ? { ...msg, content: msg.content + delta } : msg)); },
      });
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Connexion interrompue. Réessayez ou contactez support@nexmart.ma", timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const renderContent = (text: string) =>
    text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-gold-200/40 dark:border-gold-800/20"
            style={{
              width: "min(360px, calc(100vw - 2rem))",
              height: "min(520px, calc(100vh - 8rem))",
              boxShadow: "0 32px 80px rgba(15,23,42,0.22), 0 0 0 1px rgba(212,175,55,0.12)",
              background: "var(--background)",
            }}
          >
            {/* Gold top line */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent flex-shrink-0" />

            {/* Header — Moroccan dark */}
            <div className="relative flex flex-shrink-0 items-center gap-3 bg-moroccan-navy p-4 text-white">
              <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />
              <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-brand">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">NexBot</span>
                  <Sparkles className="h-3 w-3 text-gold-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  <span className="text-[11px] text-white/65">Assistant IA · En ligne</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Fermer">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-700">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-brand-700 text-white"
                      : "rounded-tl-sm bg-muted text-foreground border border-gold-200/30 dark:border-gold-800/15"
                  }`}>
                    {renderContent(msg.content)}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-700">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 border border-gold-200/30 dark:border-gold-800/15">
                    <div className="flex items-center gap-1.5">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.div key={i} className="h-2 w-2 rounded-full bg-brand-600/50"
                          animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="rounded-full border border-gold-200/40 bg-white dark:bg-card px-3 py-1.5 text-xs hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-gold-200/30 dark:border-gold-800/15 bg-white/80 dark:bg-card/80 p-3 backdrop-blur">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message…" disabled={loading} maxLength={1000}
                  className="flex-1 rounded-xl border border-border bg-muted/60 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10" />
                <button type="submit" disabled={!input.trim() || loading}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white transition-all hover:bg-brand-600 hover:shadow-brand disabled:opacity-40"
                  aria-label="Envoyer">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
                <Sparkles className="h-2.5 w-2.5 text-gold-500" />
                Powered by NexMart AI · Maroc
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB trigger — Moroccan style */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-[0_8px_32px_rgba(15,118,110,0.5)] hover:bg-brand-600 transition-colors"
        style={{ boxShadow: "0 8px 32px rgba(15,118,110,0.45), 0 2px 8px rgba(15,23,42,0.2)" }}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {/* Moroccan ornament ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold-400/30 animate-pulse-gold" />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-black text-moroccan-navy">
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

async function readAssistantStream(
  response: Response,
  handlers: { onConversationId: (id: string) => void; onDelta: (delta: string) => void }
) {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      const eventName = event.split("\n").find((line) => line.startsWith("event: "))?.slice(7);
      const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      const data = JSON.parse(dataLine.slice(6));
      if (eventName === "meta" && data.conversationId) handlers.onConversationId(data.conversationId);
      if (eventName === "delta" && data.text) handlers.onDelta(data.text);
    }
  }
}
