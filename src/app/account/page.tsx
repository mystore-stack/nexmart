"use client";
// src/app/account/page.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Shield, Bell, Package, Heart,
  MapPin, ChevronRight, Save, Camera, Eye, EyeOff, Lock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/index";
import { formatDate } from "@/utils/format";
import toast from "react-hot-toast";

type Tab = "profile" | "security" | "addresses" | "notifications";

export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({
    current: "", newPw: "", confirm: ""
  });
  const [showPw, setShowPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user!, ...data.data });
        toast.success("Profil mis à jour !");
      } else {
        toast.error(data.error || "Échec de la mise à jour");
      }
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPw !== passwords.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mot de passe modifié !");
        setPasswords({ current: "", newPw: "", confirm: "" });
      } else {
        toast.error(data.error || "Échec de la modification");
      }
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "addresses", label: "Adresses", icon: MapPin },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const QUICK_LINKS = [
    { icon: Package, label: "Mes commandes", href: "/orders", count: null },
    { icon: Heart, label: "Favoris", href: "/wishlist", count: null },
  ];

  return (
    <div className="page-enter min-h-screen bg-background">
      <div className="relative border-b border-gold-200/40 dark:border-gold-800/20 bg-surface/80">
        <div className="container-main py-6">
          <h1 className="font-display text-3xl font-semibold">Mon Compte</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez votre profil, commandes et préférences
          </p>
        </div>
      </div>

      <div className="container-main py-8 max-w-5xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Avatar */}
            <div className="glass-card rounded-2xl p-5 text-center border-gold-200/30 dark:border-gold-800/20">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <div className="w-20 h-20 rounded-full bg-brand-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    user?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-white shadow-md hover:bg-brand-600 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-bold">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              {user?.createdAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {formatDate(user.createdAt, { month: "long", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Quick links */}
            <div className="overflow-hidden rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card">
              {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors border-b border-border last:border-0"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </Link>
              ))}
            </div>

            {/* Tab nav */}
            <nav className="overflow-hidden rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-border last:border-0 ${
                    tab === id
                      ? "bg-foreground text-background"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "profile" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <h2 className="text-lg font-bold">Personal Information</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                          className="input pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="btn-primary py-2.5 px-6"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="w-4 h-4" /> Enregistrer
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {tab === "security" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <h2 className="text-lg font-bold">Password & Security</h2>

                  <div className="space-y-4">
                    {[
                      { key: "current", label: "Mot de passe actuel", placeholder: "Enter current password" },
                      { key: "newPw", label: "Nouveau mot de passe", placeholder: "Enter new password" },
                      { key: "confirm", label: "Confirm Nouveau mot de passe", placeholder: "Repeat new password" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-sm font-medium">{label}</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showPw ? "text" : "password"}
                            value={passwords[key as keyof typeof passwords]}
                            onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="input pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={changePassword}
                      disabled={saving || !passwords.current || !passwords.newPw}
                      className="btn-primary py-2.5 px-6"
                    >
                      {saving ? "Updating..." : "Update Password"}
                    </button>
                  </div>

                  {/* Active sessions placeholder */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold mb-3">Active Sessions</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {typeof navigator !== "undefined" ? navigator.platform : "Unknown"} · Active now
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                </div>
              )}

              {tab === "addresses" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Saved Addresses</h2>
                    <Link href="/account/addresses/new" className="btn-primary py-2 px-4 text-sm">
                      + Add Address
                    </Link>
                  </div>
                  <AddressList />
                </div>
              )}

              {tab === "notifications" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                  <h2 className="text-lg font-bold">Notification Preferences</h2>
                  {[
                    { label: "Order Updates", sub: "Confirmations, shipping, delivery", defaultOn: true },
                    { label: "Price Drops", sub: "When wishlisted items go on sale", defaultOn: true },
                    { label: "Back in Stock", sub: "When out-of-stock items return", defaultOn: false },
                    { label: "Promotions", sub: "Exclusive deals and special offers", defaultOn: false },
                    { label: "New Arrivals", sub: "Fresh products in your favorite categories", defaultOn: false },
                  ].map(({ label, sub, defaultOn }) => (
                    <NotifToggle key={label} label={label} sub={sub} defaultOn={defaultOn} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressList() {
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/addresses")
      .then((r) => r.json())
      .then((d) => { if (d.data) setAddresses(d.data); })
      .catch(() => {});
  }, []);

  if (addresses.length === 0) {
    return (
      <div className="text-center py-10">
        <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-semibold">No addresses yet</p>
        <p className="text-sm text-muted-foreground mt-1">Add an address for faster checkout.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <div key={addr.id} className="p-4 rounded-xl border border-border flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">{addr.name} {addr.isDefault && <span className="badge badge-brand ml-2 text-[10px]">Default</span>}</p>
              <p className="text-muted-foreground mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
              <p className="text-muted-foreground">{addr.phone}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/account/addresses/${addr.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium">Edit</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotifToggle({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? "bg-foreground" : "bg-muted-foreground/30"}`}
        aria-label={`Toggle ${label}`}
        role="switch"
        aria-checked={on}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
