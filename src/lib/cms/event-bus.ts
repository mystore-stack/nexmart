// src/lib/cms/event-bus.ts - CMS Event Bus Implementation

import { CMSEventType, type CMSEventPayload, type CMSEventListener, type CMSEventSubscription } from './events';

// Re-export CMSEventType for convenience
export { CMSEventType };

class CMSEventBus {
  private listeners: Map<CMSEventType, CMSEventSubscription[]> = new Map();
  private subscriptionIdCounter = 0;

  /**
   * Subscribe to CMS events
   */
  on(eventType: CMSEventType, listener: CMSEventListener): () => void {
    const subscription: CMSEventSubscription = {
      id: `sub_${++this.subscriptionIdCounter}`,
      eventType,
      listener,
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(subscription);

    // Return unsubscribe function
    return () => this.unsubscribe(subscription.id);
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first trigger)
   */
  once(eventType: CMSEventType, listener: CMSEventListener): () => void {
    const subscription: CMSEventSubscription = {
      id: `sub_${++this.subscriptionIdCounter}`,
      eventType,
      listener,
      once: true,
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(subscription);

    return () => this.unsubscribe(subscription.id);
  }

  /**
   * Unsubscribe from event
   */
  unsubscribe(subscriptionId: string): void {
    for (const [eventType, subscriptions] of this.listeners.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.listeners.delete(eventType);
        }
        break;
      }
    }
  }

  /**
   * Emit event to all subscribers
   */
  async emit(event: CMSEventPayload): Promise<void> {
    const subscriptions = this.listeners.get(event.type) || [];
    
    for (const subscription of [...subscriptions]) {
      try {
        await subscription.listener(event);
        
        // Auto-unsubscribe if once flag is set
        if (subscription.once) {
          this.unsubscribe(subscription.id);
        }
      } catch (error) {
        console.error(`[CMS Event Bus] Error in listener for ${event.type}:`, error);
      }
    }
  }

  /**
   * Clear all listeners (useful for testing)
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for event type
   */
  listenerCount(eventType: CMSEventType): number {
    return this.listeners.get(eventType)?.length || 0;
  }
}

// Singleton instance
export const cmsEventBus = new CMSEventBus();

// Convenience functions
export function onCMSEvent(eventType: CMSEventType, listener: CMSEventListener): () => void {
  return cmsEventBus.on(eventType, listener);
}

export function onceCMSEvent(eventType: CMSEventType, listener: CMSEventListener): () => void {
  return cmsEventBus.once(eventType, listener);
}

export async function emitCMSEvent(event: CMSEventPayload): Promise<void> {
  await cmsEventBus.emit(event);
}
