// src/lib/queues.ts
// BullMQ queues have been disabled (Redis removed)
// All queue operations are now no-ops

const disabledQueue = {
  add: async () => null,
  getWaiting: async () => [],
  getActive: async () => [],
  getCompleted: async () => [],
  getFailed: async () => [],
  close: async () => {},
} as any;

const disabledWorker = {
  on: () => disabledWorker,
  close: async () => {},
} as any;

const connection = { connection: {} };

const createQueue = <T = any>(name: string): any => {
  return disabledQueue;
};

// ─── Queue definitions ───────────────────────────────────────

export const emailQueue = createQueue("emails");
export const orderQueue = createQueue("orders");
export const notificationQueue = createQueue("notifications");
export const inventoryQueue = createQueue("inventory");
export const aiQueue = createQueue("ai");

// ─── Job types ───────────────────────────────────────────────

export type EmailJobData =
  | { type: "welcome"; email: string; name: string }
  | { type: "order_confirm"; email: string; name: string; orderId: string }
  | { type: "password_reset"; email: string; name: string; token: string }
  | { type: "shipping_update"; email: string; name: string; orderId: string; status: string };

export type OrderJobData =
  | { type: "process_payment"; orderId: string; organizationId: string; paymentIntentId: string }
  | { type: "update_inventory"; orderId: string; organizationId: string }
  | { type: "send_confirmation"; orderId: string; organizationId: string };

export type NotificationJobData = {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
};

export type AiJobData =
  | { type: "index_product"; productId: string; organizationId: string }
  | { type: "score_order_fraud"; orderId: string; organizationId: string }
  | { type: "abandoned_cart"; userId: string; organizationId: string };

// ─── Job adders ──────────────────────────────────────────────

export async function queueEmail(data: EmailJobData, delay: number = 0) {
  // Queue disabled - Redis removed
  return null;
}

export async function queueOrderJob(data: OrderJobData) {
  // Queue disabled - Redis removed
  return null;
}

export async function queueNotification(data: NotificationJobData) {
  // Queue disabled - Redis removed
  return null;
}

export async function queueAiJob(data: AiJobData) {
  // Queue disabled - Redis removed
  return null;
}

// ─── Worker setup (disabled - Redis removed) ──────────────────────────

export function startWorkers() {
  console.log("[Queue] Workers disabled - Redis removed from project");
}
