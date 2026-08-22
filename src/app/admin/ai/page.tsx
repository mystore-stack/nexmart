"use client";

import { useEffect, useState } from "react";
import { Bot, Brain, MessageSquare, ShieldAlert, Sparkles, Search } from "lucide-react";

type MonitorData = {
  stats: {
    conversations: number;
    messages: number;
    blockedMessages: number;
    embeddings: number;
    events: { type: string; count: number }[];
  };
  conversations: {
    id: string;
    status: string;
    title: string | null;
    updatedAt: string;
    lastMessage: string;
    user?: { email: string; name: string } | null;
  }[];
};

export default function AdminAiPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ai/monitor")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData({ stats: json.stats, conversations: json.conversations });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Conversations", value: data?.stats.conversations ?? 0, icon: MessageSquare },
    { label: "Messages", value: data?.stats.messages ?? 0, icon: Bot },
    { label: "Embeddings", value: data?.stats.embeddings ?? 0, icon: Brain },
    { label: "Blocked", value: data?.stats.blockedMessages ?? 0, icon: ShieldAlert },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Monitor assistant quality, semantic search, recommendations, moderation, and embeddings.
          </p>
        </div>
        <button
          onClick={() =>
            fetch("/api/ai/embeddings/product", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ limit: 25 }),
            })
          }
          className="btn-primary"
        >
          <Sparkles className="w-4 h-4" />
          Index products
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-brand-500" />
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? "..." : value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold">Recent AI Conversations</h2>
          </div>
          <div className="divide-y divide-border">
            {(data?.conversations || []).map((conversation) => (
              <div key={conversation.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{conversation.title || "Untitled conversation"}</p>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">{conversation.status}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{conversation.lastMessage}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {conversation.user?.email || "Anonymous"} · {new Date(conversation.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
            {!loading && !data?.conversations.length && (
              <div className="p-8 text-center text-sm text-muted-foreground">No AI conversations yet.</div>
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-brand-500" />
            <h2 className="font-semibold">Behavior Events</h2>
          </div>
          <div className="space-y-3">
            {(data?.stats.events || []).map((event) => (
              <div key={event.type} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{event.type}</span>
                <span className="font-semibold">{event.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
