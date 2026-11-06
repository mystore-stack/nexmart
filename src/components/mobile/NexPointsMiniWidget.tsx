"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";

/**
 * NexMart — NexPoints Mini Widget
 * Injected at the top of the Account page in app mode.
 * Invisible on web browsers.
 */

export function NexPointsMiniWidget() {
  const [isApp, setIsApp] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("Débutant");

  useEffect(() => {
    if (!navigator.userAgent.includes("NexmartApp")) return;
    setIsApp(true);

    fetch("/api/loyalty", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setBalance(d.balance ?? 0);
          setTier(d.tier?.label ?? "Débutant");
        }
      })
      .catch(() => {});
  }, []);

  if (!isApp) return null;

  return (
    <Link href="/account#nexpoints" style={{ textDecoration: "none", display: "block", margin: "0 0 16px" }}>
      <div style={{
        background: "linear-gradient(135deg, #084C3E 0%, #0B6B57 100%)",
        borderRadius: "20px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        boxShadow: "0 4px 20px rgba(11,107,87,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: "rgba(200,241,105,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Award size={24} color="#C8F169" />
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", margin: "0 0 2px" }}>Mes NexPoints</p>
            <p style={{ fontSize: "22px", fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1 }}>
              {balance !== null ? balance.toLocaleString("fr-MA") : "—"}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#C8F169", marginLeft: "4px" }}>pts</span>
            </p>
            <p style={{ fontSize: "12px", color: "#C8F169", fontWeight: 600, margin: "2px 0 0" }}>{tier}</p>
          </div>
        </div>
        <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
      </div>
    </Link>
  );
}
