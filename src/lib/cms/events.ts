// src/lib/cms/events.ts - CMS Event System

import type { CMSDomain } from './types';

// Event Types
export enum CMSEventType {
  HOMEPAGE_UPDATED = 'CMS_HOME_UPDATED',
  FOOTER_UPDATED = 'CMS_FOOTER_UPDATED',
  ANNOUNCEMENT_UPDATED = 'CMS_ANNOUNCEMENT_UPDATED',
  MEDIA_UPDATED = 'CMS_MEDIA_UPDATED',
  CACHE_INVALIDATED = 'CMS_CACHE_INVALIDATED',
}

// Event Payload Interface
export interface CMSEventPayload {
  type: CMSEventType;
  domain: CMSDomain;
  organizationId: string;
  timestamp: Date;
  data?: any;
  metadata?: {
    userId?: string;
    source?: 'admin' | 'api' | 'system';
    version?: number;
  };
}

// Event Listener Interface
export interface CMSEventListener {
  (event: CMSEventPayload): void | Promise<void>;
}

// Event Subscription Interface
export interface CMSEventSubscription {
  id: string;
  eventType: CMSEventType;
  listener: CMSEventListener;
  once?: boolean;
}
