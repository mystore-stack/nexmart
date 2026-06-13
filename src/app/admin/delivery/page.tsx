"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { formatPrice, formatDateTime } from "@/utils/format";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { name: string };
};

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders?status=SHIPPED&limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        // Handle nested response structure: { success: true, data: { data: [...], pagination: {...} } }
        const responseData = d.data;
        const list = d.success ? (Array.isArray(responseData?.data) ? responseData.data : Array.isArray(d.data) ? d.data : []) : [];

        console.log("========== FULL DELIVERY API RESPONSE ==========");
        console.log(JSON.stringify(d, null, 2));
        console.log("success =", d.success);
        console.log("data =", d.data);
        console.log("responseData =", responseData);
        console.log("responseData.data =", responseData?.data);
        console.log("isArray(responseData.data) =", Array.isArray(responseData?.data));
        console.log("orders length =", list.length);

        console.log("BEFORE setOrders");
        console.log("orders passed to state =", list?.length);

        setOrders(list);
      })
      .finally(() => setLoading(false));
  }, []);

  // Log state changes
  useEffect(() => {
    console.log("STATE delivery orders changed:", orders.length);
  }, [orders]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-6 h-6" /> Livraisons
        </h1>
        <p className="text-sm text-muted-foreground">Suivi et mise à jour des expéditions</p>
      </div>
      {loading ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Commande</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">Total</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3">
                    <Link href={`/admin/orders`} className="font-medium hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</p>
                  </td>
                  <td className="p-3">{o.user?.name || "—"}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3 text-right">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    {o.status !== "DELIVERED" && (
                      <button
                        type="button"
                        className="btn-outline text-xs py-1"
                        onClick={() => updateStatus(o.id, "DELIVERED")}
                      >
                        Marquer livré
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
