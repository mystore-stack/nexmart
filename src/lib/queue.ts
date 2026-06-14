// src/lib/queue.ts
import { Queue, Worker, Job } from "bullmq";

// Queue configuration - use REDIS_URL directly
const QUEUE_CONFIG = {
  connection: {
    url: process.env.REDIS_URL,
  },
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

// Create queues
export const emailQueue = new Queue(QUEUES.EMAIL, QUEUE_CONFIG);
export const analyticsQueue = new Queue(QUEUES.ANALYTICS, QUEUE_CONFIG);
export const notificationsQueue = new Queue(QUEUES.NOTIFICATIONS, QUEUE_CONFIG);
export const inventorySyncQueue = new Queue(QUEUES.INVENTORY_SYNC, QUEUE_CONFIG);
export const aiScoringQueue = new Queue(QUEUES.AI_SCORING, QUEUE_CONFIG);
export const abandonedCartQueue = new Queue(QUEUES.ABANDONED_CART, QUEUE_CONFIG);

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

// Worker setup (for production deployment)
export function createWorkers() {
  // Email worker
  const emailWorker = new Worker<EmailJobData>(
    QUEUES.EMAIL,
    async (job: Job<EmailJobData>) => {
      console.log(`[EMAIL_WORKER] Processing job ${job.id}:`, job.data);
      // TODO: Implement email sending logic
      // await sendEmail(job.data.to, job.data.subject, job.data.template, job.data.data);
    },
    QUEUE_CONFIG
  );

  // Analytics worker
  const analyticsWorker = new Worker<AnalyticsJobData>(
    QUEUES.ANALYTICS,
    async (job: Job<AnalyticsJobData>) => {
      console.log(`[ANALYTICS_WORKER] Processing job ${job.id}:`, job.data);
      // TODO: Implement analytics processing logic
    },
    QUEUE_CONFIG
  );

  // Notifications worker
  const notificationsWorker = new Worker<NotificationJobData>(
    QUEUES.NOTIFICATIONS,
    async (job: Job<NotificationJobData>) => {
      console.log(`[NOTIFICATIONS_WORKER] Processing job ${job.id}:`, job.data);
      // TODO: Implement notification sending logic
    },
    QUEUE_CONFIG
  );

  // Inventory sync worker
  const inventorySyncWorker = new Worker<InventorySyncJobData>(
    QUEUES.INVENTORY_SYNC,
    async (job: Job<InventorySyncJobData>) => {
      console.log(`[INVENTORY_WORKER] Processing job ${job.id}:`, job.data);
      // TODO: Implement inventory sync logic
    },
    QUEUE_CONFIG
  );

  // AI scoring worker
  const aiScoringWorker = new Worker<AIScoringJobData>(
    QUEUES.AI_SCORING,
    async (job: Job<AIScoringJobData>) => {
      console.log(`[AI_WORKER] Processing job ${job.id}:`, job.data);
      // TODO: Implement AI scoring logic
    },
    QUEUE_CONFIG
  );

  // Abandoned cart worker
  const abandonedCartWorker = new Worker<AbandonedCartJobData>(
    QUEUES.ABANDONED_CART,
    async (job: Job<AbandonedCartJobData>) => {
      console.log(`[ABANDONED_CART_WORKER] Processing job ${job.id}:`, job.data);
      // TODO: Implement abandoned cart recovery logic
    },
    QUEUE_CONFIG
  );

  // Error handling
  const workers = [
    emailWorker,
    analyticsWorker,
    notificationsWorker,
    inventorySyncWorker,
    aiScoringWorker,
    abandonedCartWorker,
  ];

  workers.forEach((worker) => {
    worker.on("failed", (job) => {
      console.error(`[WORKER] Job ${job?.id} failed:`, job?.failedReason);
    });

    worker.on("completed", (job) => {
      console.log(`[WORKER] Job ${job?.id} completed`);
    });
  });

  return workers;
}

// Queue health check
export async function getQueueHealth() {
  const queues = [
    emailQueue,
    analyticsQueue,
    notificationsQueue,
    inventorySyncQueue,
    aiScoringQueue,
    abandonedCartQueue,
  ];

  const health = await Promise.all(
    queues.map(async (queue) => {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      return {
        name: queue.name,
        waiting,
        active,
        completed,
        failed,
      };
    })
  );

  return health;
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
