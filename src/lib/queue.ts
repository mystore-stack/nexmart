// src/lib/queue.ts
// BullMQ queues have been disabled (Redis removed)
// All queue operations are now no-ops

const disabledQueue = {
  add: async () => null,
  getWaiting: async () => [],
  getActive: async () => [],
  getCompleted: async () => [],
  getFailed: async () => [],
  getWaitingCount: async () => 0,
  getActiveCount: async () => 0,
  getCompletedCount: async () => 0,
  getFailedCount: async () => 0,
  close: async () => {},
} as any;

const disabledWorker = {
  on: () => disabledWorker,
  close: async () => {},
} as any;

const QUEUE_CONFIG = {
  connection: {},
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};

// Queue names
export const QUEUES = {
  EMAIL: "email-queue",
  ANALYTICS: "analytics-queue",
  NOTIFICATIONS: "notifications-queue",
  INVENTORY_SYNC: "inventory-sync-queue",
  AI_SCORING: "ai-scoring-queue",
  ABANDONED_CART: "abandoned-cart-queue",
} as const;

// Create disabled queues
export const emailQueue = disabledQueue;
export const analyticsQueue = disabledQueue;
export const notificationsQueue = disabledQueue;
export const inventorySyncQueue = disabledQueue;
export const aiScoringQueue = disabledQueue;
export const abandonedCartQueue = disabledQueue;

// Job types
export interface EmailJobData {
  type: "order_confirmation" | "shipping_update" | "password_reset";
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface AnalyticsJobData {
  type: "event_tracking" | "revenue_update" | "user_behavior";
  data: Record<string, any>;
}

export interface NotificationJobData {
  type: "push" | "sms" | "telegram";
  userId: string;
  message: string;
  data?: Record<string, any>;
}

export interface InventorySyncJobData {
  type: "stock_update" | "price_update";
  productId: string;
  data: Record<string, any>;
}

export interface AIScoringJobData {
  type: "conversion_score" | "recommendation" | "fraud_detection";
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

export interface AbandonedCartJobData {
  userId: string;
  cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  cartValue: number;
  lastActivity: Date;
}

// Add job helpers
export async function addEmailJob(data: EmailJobData, options?: any) {
  return await emailQueue.add("email", data, options);
}

export async function addAnalyticsJob(data: AnalyticsJobData, options?: any) {
  return await analyticsQueue.add("analytics", data, options);
}

export async function addNotificationJob(data: NotificationJobData, options?: any) {
  return await notificationsQueue.add("notification", data, options);
}

export async function addInventorySyncJob(data: InventorySyncJobData, options?: any) {
  return await inventorySyncQueue.add("inventory-sync", data, options);
}

export async function addAIScoringJob(data: AIScoringJobData, options?: any) {
  return await aiScoringQueue.add("ai-scoring", data, options);
}

export async function addAbandonedCartJob(data: AbandonedCartJobData, options?: any) {
  return await abandonedCartQueue.add("abandoned-cart", data, {
    ...options,
    delay: 10 * 60 * 1000, // 10 minutes delay
  });
}

// Worker setup (disabled - Redis removed)
export function createWorkers() {
  console.log("[Queue] Workers disabled - Redis removed from project");
  return [disabledWorker, disabledWorker, disabledWorker, disabledWorker, disabledWorker, disabledWorker];
}

// Queue health check (disabled - Redis removed)
export async function getQueueHealth() {
  return [
    { name: "email-queue", waiting: 0, active: 0, completed: 0, failed: 0 },
    { name: "analytics-queue", waiting: 0, active: 0, completed: 0, failed: 0 },
    { name: "notifications-queue", waiting: 0, active: 0, completed: 0, failed: 0 },
    { name: "inventory-sync-queue", waiting: 0, active: 0, completed: 0, failed: 0 },
    { name: "ai-scoring-queue", waiting: 0, active: 0, completed: 0, failed: 0 },
    { name: "abandoned-cart-queue", waiting: 0, active: 0, completed: 0, failed: 0 },
  ];
}

export default {
  emailQueue,
  analyticsQueue,
  notificationsQueue,
  inventorySyncQueue,
  aiScoringQueue,
  abandonedCartQueue,
  addEmailJob,
  addAnalyticsJob,
  addNotificationJob,
  addInventorySyncJob,
  addAIScoringJob,
  addAbandonedCartJob,
  createWorkers,
  getQueueHealth,
};
