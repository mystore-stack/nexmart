// src/lib/audit/client.ts
import type { AuditEventType } from "./types";

/**
 * Production-grade Audit SDK (Client-side)
 * 
 * Usage:
 * ```ts
 * import { audit } from "@/lib/audit/client";
 * 
 * // Initialize session
 * const session = await audit.initSession();
 * 
 * // Log events
 * await audit.event("CHECKOUT_START", { cartItems: 5 });
 * 
 * // Track checkout steps
 * await audit.trackStep("ADDRESS");
 * ```
 */

class ClientAuditSDK {
  private sessionId: string | null = null;
  private organizationId: string | null = null;
  private userId: string | null = null;
  private eventQueue: Array<{ eventType: AuditEventType; metadata?: any }> = [];
  private flushInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize audit session
   */
  async initSession(organizationId?: string, userId?: string) {
    this.organizationId = organizationId || this.getFromStorage("organizationId");
    this.userId = userId || this.getFromStorage("userId");

    // Check for existing session
    this.sessionId = this.getFromStorage("auditSessionId");

    if (!this.sessionId) {
      const response = await fetch("/api/audit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: this.organizationId || "",
          userId: this.userId || "",
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session?.id) {
          this.sessionId = data.session.id;
          this.setToStorage("auditSessionId", this.sessionId);
        } else {
          console.error("[AUDIT] Session creation failed: no session ID in response", data);
        }
      }
    }

    // Start flush interval
    this.startFlushInterval();

    return this.sessionId;
  }

  /**
   * Log an audit event
   */
  async event(eventType: AuditEventType, metadata?: any) {
    if (!this.sessionId) {
      await this.initSession();
    }

    // Add to queue
    this.eventQueue.push({ eventType, metadata });

    // Flush immediately for critical events
    if (
      eventType === "CHECKOUT_COMPLETE" ||
      eventType === "PAYMENT_SUCCESS" ||
      eventType === "ORDER_CREATED"
    ) {
      await this.flush();
    }
  }

  /**
   * Track checkout step completion
   */
  async trackStep(step: string) {
    await this.event("CHECKOUT_STEP_" + step.toUpperCase() as any, { step });
  }

  /**
   * Track cart events
   */
  cart = {
    viewed: (items: any[]) => this.event("CART_VIEWED", { itemCount: items.length, items }),
    itemAdded: (product: any, quantity: number) => this.event("CART_ITEM_ADDED", { productId: product.id, quantity }),
    itemRemoved: (itemId: string) => this.event("CART_ITEM_REMOVED", { itemId }),
    itemUpdated: (itemId: string, quantity: number) => this.event("CART_ITEM_UPDATED", { itemId, quantity }),
    cleared: () => this.event("CART_CLEARED"),
  };

  /**
   * Track payment events
   */
  payment = {
    initiated: (amount: number, method: string) => this.event("PAYMENT_INITIATED", { amount, method }),
    success: (paymentId: string, amount: number) => this.event("PAYMENT_SUCCESS", { paymentId, amount }),
    failed: (error: string, amount: number) => this.event("PAYMENT_FAILED", { error, amount }),
    error: (error: string) => this.event("PAYMENT_ERROR", { error }),
  };

  /**
   * Track checkout events
   */
  checkout = {
    start: (cartItems: any[]) => this.event("CHECKOUT_START", { cartItems }),
    complete: (orderId: string, total: number) => {
      return this.event("CHECKOUT_COMPLETE", { orderId, total }).then(() => this.completeSession(total));
    },
    error: (error: string) => this.event("CHECKOUT_ERROR", { error }),
  };

  /**
   * Track coupon events
   */
  coupon = {
    applied: (code: string, discount: number) => this.event("COUPON_APPLIED", { code, discount }),
    removed: (code: string) => this.event("COUPON_REMOVED", { code }),
  };

  /**
   * Mark session as complete
   */
  async completeSession(conversionValue?: number) {
    if (!this.sessionId) return;

    await fetch("/api/audit/session/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: this.sessionId,
        conversionValue,
      }),
    });

    // Clear session from storage
    this.removeFromStorage("auditSessionId");
    this.sessionId = null;
  }

  /**
   * Mark session as abandoned
   */
  async markAbandoned() {
    if (!this.sessionId) return;

    await fetch("/api/audit/session/abandon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: this.sessionId }),
    });

    this.removeFromStorage("auditSessionId");
    this.sessionId = null;
  }

  /**
   * Flush event queue to server
   */
  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch("/api/audit/events/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.sessionId,
          organizationId: this.organizationId,
          userId: this.userId,
          events,
        }),
      });
    } catch (error) {
      console.error("[AUDIT] Failed to flush events:", error);
      // Re-queue failed events
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Start automatic flush interval
   */
  private startFlushInterval() {
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Stop automatic flush interval
   */
  private stopFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Get value from localStorage
   */
  private getFromStorage(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }

  /**
   * Set value to localStorage
   */
  private setToStorage(key: string, value: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }

  /**
   * Remove value from localStorage
   */
  private removeFromStorage(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

  /**
   * Cleanup on page unload
   */
  destroy() {
    this.stopFlushInterval();
    this.flush();
  }
}

// Singleton instance
export const audit = new ClientAuditSDK();

// Auto-initialize on client
if (typeof window !== "undefined") {
  // Initialize on page load
  audit.initSession();

  // Mark session as abandoned on page unload (if not completed)
  window.addEventListener("beforeunload", () => {
    audit.markAbandoned();
  });
}
