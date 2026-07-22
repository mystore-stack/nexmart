// src/components/home/MysteryBoxSection.tsx
import { MysteryBox } from "@/types";
import Link from "next/link";

interface MysteryBoxSectionProps {
  mysteryBoxes: MysteryBox[];
}

export function MysteryBoxSection({ mysteryBoxes }: MysteryBoxSectionProps) {
  const hasBoxes = mysteryBoxes && mysteryBoxes.length > 0;
  const box = hasBoxes ? mysteryBoxes[0] : null;

  return (
    <section className="section">
      <div className="container-main">
        <div className="rounded-2xl p-8" style={{ backgroundColor: "#0F172A" }}>
          {box ? (
            <>
              {box.stock <= 20 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                    Only {box.stock} left
                  </span>
                </div>
              )}
              <h2 className="font-display text-4xl font-semibold leading-tight mb-2" style={{ color: "#D4AF37" }}>
                {box.name}
              </h2>
              <p className="text-base font-semibold text-white mb-2">{box.valueLabel}</p>
              <p className="text-base text-neutral-400 leading-relaxed mb-6">{box.description}</p>
              <Link
                href="/m/mystery-box"
                className="btn btn-gold btn-lg w-full justify-center inline-flex text-base font-semibold"
              >
                Open Your Box →
              </Link>
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="font-display text-4xl font-semibold leading-tight mb-2" style={{ color: "#D4AF37" }}>
                Mystery Box
              </h2>
              <p className="text-base text-neutral-400 leading-relaxed mb-6">
                Coming soon - Curated premium products, selected by our team.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}