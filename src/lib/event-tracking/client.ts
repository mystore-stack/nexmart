// src/lib/event-tracking/client.ts
import { EventType } from '@prisma/client';

class EventTracker {
  private sessionId: string;
  private userId: string | null = null;
  private organizationId: string | null = null;
  private queue: Array<any> = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private batchSize = 10;
  private flushDelay = 5000; // 5 seconds

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = this.getUserId();
    this.organizationId = this.getOrganizationId();
    this.startFlushInterval();
  }

  track(eventType: EventType, properties?: Record<string, any>) {
    const event = {
      eventType,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        organizationId: this.organizationId,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    this.queue.push(event);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('[Event Tracker] Failed to flush events:', error);
      // Re-add failed events to queue
      this.queue.unshift(...events);
    }
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushDelay);
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('event_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('event_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  private getOrganizationId(): string | null {
    return localStorage.getItem('organization_id');
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('user_id', userId);
  }

  setOrganizationId(organizationId: string) {
    this.organizationId = organizationId;
    localStorage.setItem('organization_id', organizationId);
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const eventTracker = new EventTracker();
