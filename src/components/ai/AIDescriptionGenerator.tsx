"use client";
/**
 * AIDescriptionGenerator — Admin product description tool
 * Generates SEO-optimized multilingual descriptions via Claude
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, Copy, RefreshCw, Globe } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  productName: string;
  category: string;
  price: number;
  tags?: string[];
  onApply: (fields: {
    description: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
  }) => void;
}

type Language = "fr" | "ar" | "en";
type Tone = "premium" | "casual" | "technical";

export function AIDescriptionGenerator({ productName, category, price, tags = [], onApply }: Props) {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<any>(null);
  const [language, setLanguage] = useState<Language>("fr");
  const [tone,     setTone]     = useState<Tone>("premium");

  const generate = async () => {
    if (!productName || !category) {
      toast.error("Please fill in product name and category first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName, category, price, tags, language, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        toast.success("Description generated!");
      } else {
        toast.error("Generation failed. Check your API key.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div className="border border-dashed border-brand-300 rounded-xl overflow-hidden">
      {/* Trigger */}
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-left">
        <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">AI Description Generator</p>
          <p className="text-[11px] text-muted-foreground">Generate SEO-optimized descriptions with Claude</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          className="w-5 h-5 text-muted-foreground">▼</motion.div>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1.5">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
                    className="input text-sm">
                    <option value="fr">🇫🇷 French</option>
                    <option value="ar">🇲🇦 Arabic</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>
                <div>
                  <label className="label mb-1.5">Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}
                    className="input text-sm">
                    <option value="premium">✨ Premium</option>
                    <option value="casual">😊 Casual</option>
                    <option value="technical">🔬 Technical</option>
                  </select>
                </div>
              </div>

              <button type="button" onClick={generate} disabled={loading}
                className="btn-brand w-full justify-center py-2.5">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Generating with Claude...</>
                  : <><Sparkles className="w-4 h-4" />Generate Description</>
                }
              </button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-2 border-t border-border">

                    {/* Description */}
                    <ResultBlock label="Description" value={result.description}
                      onCopy={() => copy(result.description)}
                      onApply={() => onApply({ description: result.description })} />

                    {/* SEO Title */}
                    {result.seoTitle && (
                      <ResultBlock label="SEO Title" value={result.seoTitle}
                        onCopy={() => copy(result.seoTitle)} />
                    )}

                    {/* SEO Description */}
                    {result.seoDescription && (
                      <ResultBlock label="Meta Description" value={result.seoDescription}
                        onCopy={() => copy(result.seoDescription)} />
                    )}

                    {/* Key Features */}
                    {result.keyFeatures?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Key Features</p>
                        <ul className="space-y-1">
                          {result.keyFeatures.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tags */}
                    {result.tags?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Suggested Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.tags.map((t: string) => (
                            <span key={t} className="badge-muted text-xs">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply all */}
                    <button type="button"
                      onClick={() => onApply({ description: result.description, seoTitle: result.seoTitle, seoDescription: result.seoDescription, tags: result.tags })}
                      className="btn-primary w-full justify-center py-2 text-sm">
                      <Check className="w-4 h-4" />Apply All to Form
                    </button>

                    <button type="button" onClick={generate} className="btn-ghost w-full justify-center py-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-3.5 h-3.5" />Regenerate
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultBlock({ label, value, onCopy, onApply }: {
  label: string; value: string; onCopy: () => void; onApply?: () => void;
}) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex gap-1">
          {onApply && (
            <button type="button" onClick={onApply}
              className="p-1 rounded hover:bg-brand-100 dark:hover:bg-brand-900/40 text-brand-600 transition-colors" title="Apply">
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onCopy}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors" title="Copy">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
