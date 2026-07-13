import { useEffect, useRef, useCallback } from "react";
import { useAtom } from "jotai";
import { atom } from "jotai";

export interface InventoryUpdate {
  type: "inventory_update";
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeReason: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
}

// Atom to store inventory updates
export const inventoryUpdatesAtom = atom<InventoryUpdate[]>([]);

export function useInventoryUpdates(enabled = true) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [updates, setUpdates] = useAtom(inventoryUpdatesAtom);

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      eventSourceRef.current = new EventSource("/api/home/inventory-stream");

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "inventory_update") {
            setUpdates((prev) => [data as InventoryUpdate, ...prev.slice(0, 49)]);
          }
        } catch (error) {
          console.error("[INVENTORY_STREAM] Parse error:", error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("[INVENTORY_STREAM] Connection error:", error);
        eventSourceRef.current?.close();

        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (enabled) {
            connect();
          }
        }, 3000);
      };

      console.log("[INVENTORY_STREAM] Connected");
    } catch (error) {
      console.error("[INVENTORY_STREAM] Connection failed:", error);
    }
  }, [enabled, setUpdates]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log("[INVENTORY_STREAM] Disconnected");
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    updates,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    disconnect,
  };
}
