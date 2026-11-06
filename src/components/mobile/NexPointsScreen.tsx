"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { NexPointsBadge, MobileSkeleton } from "@/components/mobile";
import { Star, Gift, ChevronRight, Award, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

/**
 * NexMart — NexPoints Wallet Screen (Mobile)
 * Phase 1 — Design System
 * Uses /api/loyalty
 */

interface Tier { id: number; label: string; min: number; benefits: string[] }
interface Reward { id: string; kind: string; value: number; title: string; cost: number; minSubtotal: number; maxDiscount: number }
interface Transaction { id: string; type: string; amount: number; label: string; at: string }

interface LoyaltyData {
  balance: number;
  lifetime: number;
  tier: { id: number; label: string; benefits: string[] };
  tiers: Tier[];
  next: { label: string; missing: number } | null;
  history: Transaction[];
  rewards: Reward[];
}

export function NexPointsScreen() {
  const { data: session } = useSession();
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) { setLoading(false); return; }
    fetch("/api/loyalty", { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const handleRedeem = async (rewardId: string) => {
    if (redeemingId) return;
    setRedeemingId(rewardId);
    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rewardId }),
      });
      const json = await res.json();
      if (res.ok && json.couponCode) {
        alert(`✅ Coupon créé : ${json.couponCode}`);
        // Reload wallet
        const r2 = await fetch("/api/loyalty", { credentials: "include" });
        setData(await r2.json());
      } else {
        alert(json.message || "Échange impossible pour le moment");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setRedeemingId(null);
    }
  };

  const tierColors: Record<number, { bg: string; text: string; gradient: string }> = {
    1: { bg: "#EDF0ED", text: "#3D5A54", gradient: "linear-gradient(135deg, #7A9E97, #3D5A54)" },
    2: { bg: "#FDF3E8", text: "#CD7F32", gradient: "linear-gradient(135deg, #CD7F32, #A0522D)" },
    3: { bg: "#F0F3F5", text: "#607D8B", gradient: "linear-gradient(135deg, #8E9EAB, #607D8B)" },
    4: { bg: "#FFF8DC", text: "#B8860B", gradient: "linear-gradient(135deg, #D4AF37, #B8860B)" },
  };

  if (!session?.user) {
    return (
      <div className="nm-empty-state">
        <Star size={64} color="#D4AF37" strokeWidth={1.5} />
        <p className="nm-empty-state__title">Connexion requise</p>
        <p className="nm-empty-state__desc">Connectez-vous pour accéder à votre portefeuille NexPoints.</p>
        <Link href="/login" className="nm-btn nm-btn--primary" style={{ width: "auto", marginTop: "12px" }}>
          Se connecter
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <MobileSkeleton height="160px" borderRadius="20px" />
        <MobileSkeleton height="80px" borderRadius="16px" />
        <MobileSkeleton height="80px" borderRadius="16px" />
        <MobileSkeleton height="200px" borderRadius="20px" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="nm-empty-state">
        <p className="nm-empty-state__title">Données indisponibles</p>
        <p className="nm-empty-state__desc">Vérifiez votre connexion et réessayez.</p>
      </div>
    );
  }

  const tier = data.tier;
  const tierStyle = tierColors[tier.id] ?? tierColors[1];
  const progressPct = data.next
    ? Math.min(100, Math.round(((data.balance) / (data.balance + data.next.missing)) * 100))
    : 100;

  return (
    <div style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #084C3E 0%, #0B6B57 60%, #0A7D63 100%)",
        padding: "24px 20px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circle */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "160px", height: "160px", borderRadius: "50%",
          background: "rgba(200,241,105,0.08)",
        }} />

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 500, marginBottom: "4px" }}>
          Mon portefeuille
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "48px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
            {data.balance.toLocaleString("fr-MA")}
          </span>
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#C8F169" }}>pts</span>
        </div>

        {/* Tier badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "9999px", padding: "6px 14px" }}>
          <Award size={14} color="#C8F169" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{tier.label}</span>
        </div>

        {/* Progress to next tier */}
        {data.next && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Vers {data.next.label}</span>
              <span style={{ fontSize: "12px", color: "#C8F169", fontWeight: 600 }}>
                encore {data.next.missing.toLocaleString()} pts
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "9999px", height: "6px" }}>
              <div style={{
                height: "6px", borderRadius: "9999px",
                background: "linear-gradient(90deg, #C8F169, #19C79C)",
                width: `${progressPct}%`,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "16px 16px 0" }}>
        {[
          { label: "Pts gagnés (total)", value: data.lifetime.toLocaleString("fr-MA"), icon: TrendingUp, color: "#19C79C" },
          { label: "Niveau actuel",      value: tier.label,                            icon: Award,     color: "#D4AF37" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: "#fff", borderRadius: "16px",
            padding: "16px", boxShadow: "0 2px 12px rgba(12,31,27,0.07)",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={18} color={color} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "var(--nm-text-tertiary)", margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--nm-text-primary)", margin: 0 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Rewards Catalog ─────────────────────────────────────────────── */}
      <div style={{ padding: "24px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Catalogue de récompenses</h2>
          <Gift size={20} color="var(--nm-primary)" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.rewards.map((reward) => {
            const canRedeem = data.balance >= reward.cost;
            const isRedeeming = redeemingId === reward.id;
            return (
              <div key={reward.id} style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "14px 16px",
                boxShadow: "0 2px 12px rgba(12,31,27,0.07)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                opacity: canRedeem ? 1 : 0.6,
              }}>
                {/* Icon */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
                  background: canRedeem ? "linear-gradient(135deg, #084C3E, #0B6B57)" : "#EDF0ED",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Gift size={22} color={canRedeem ? "#C8F169" : "#7A9E97"} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 2px", color: "var(--nm-text-primary)" }}>{reward.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--nm-text-tertiary)", margin: 0 }}>
                    {reward.cost.toLocaleString("fr-MA")} pts · Min. {reward.minSubtotal} MAD
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canRedeem || !!redeemingId}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    border: "none",
                    background: canRedeem ? "var(--nm-primary)" : "var(--nm-surface-dim)",
                    color: canRedeem ? "#fff" : "var(--nm-text-tertiary)",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: canRedeem ? "pointer" : "default",
                    flexShrink: 0,
                    minWidth: "72px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isRedeeming ? (
                    <span className="nm-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  ) : canRedeem ? "Échanger" : "Bientôt"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transaction History ──────────────────────────────────────────── */}
      {data.history.length > 0 && (
        <div style={{ padding: "24px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Historique</h2>
            <Clock size={18} color="var(--nm-text-tertiary)" />
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(12,31,27,0.07)", overflow: "hidden" }}>
            {data.history.slice(0, 10).map((tx, idx) => (
              <div key={tx.id} style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: idx < Math.min(data.history.length, 10) - 1 ? "1px solid var(--nm-border-light)" : "none",
              }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 2px", color: "var(--nm-text-primary)" }}>{tx.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--nm-text-tertiary)", margin: 0 }}>
                    {new Date(tx.at).toLocaleDateString("fr-MA", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span style={{
                  fontSize: "15px", fontWeight: 800,
                  color: tx.type === "EARN" ? "#19C79C" : "#EF4444",
                }}>
                  {tx.type === "EARN" ? "+" : "-"}{Math.abs(tx.amount).toLocaleString("fr-MA")} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
