// src/lib/queues.ts
import { Queue, Worker, QueueEvents } from "bullmq";
import redis from "./redis";

const connection = { connection: redis };

// ─── Queue definitions ───────────────────────────────────────

export const emailQueue = new Queue("emails", connection);
export const orderQueue = new Queue("orders", connection);
export const notificationQueue = new Queue("notifications", connection);
export const inventoryQueue = new Queue("inventory", connection);

// ─── Job types ───────────────────────────────────────────────

export type EmailJobData =
  | { type: "welcome"; email: string; name: string }
  | { type: "order_confirm"; email: string; name: string; orderId: string }
  | { type: "password_reset"; email: string; name: string; token: string }
  | { type: "shipping_update"; email: string; name: string; orderId: string; status: string };

export type OrderJobData =
  | { type: "process_payment"; orderId: string; paymentIntentId: string }
  | { type: "update_inventory"; orderId: string }
  | { type: "send_confirmation"; orderId: string };

export type NotificationJobData = {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
};

// ─── Job adders ──────────────────────────────────────────────

export async function queueEmail(data: EmailJobData, delay: number = 0) {
  return emailQueue.add(data.type, data, {
    delay,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

export async function queueOrderJob(data: OrderJobData) {
  return orderQueue.add(data.type, data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  });
}

export async function queueNotification(data: NotificationJobData) {
  return notificationQueue.add("send", data, {
    attempts: 2,
    removeOnComplete: 500,
    removeOnFail: 100,
  });
}

// ─── Worker setup (run separately) ──────────────────────────

export function startWorkers() {
  // Email worker
  new Worker(
    "emails",
    async (job) => {
      const { sendWelcomeEmail, sendOrderConfirmation, sendPasswordReset, sendShippingUpdate } =
        await import("./email");
      const data = job.data as EmailJobData;

      switch (data.type) {
        case "welcome":
          await sendWelcomeEmail(data.email, data.name);
          break;
        case "password_reset":
          await sendPasswordReset(data.email, data.name, data.token);
          break;
      }
    },
    { ...connection, concurrency: 5 }
  );

  // Order worker
  new Worker(
    "orders",
    async (job) => {
      const prisma = (await import("./prisma")).default;
      const data = job.data as OrderJobData;

      switch (data.type) {
        case "update_inventory": {
          const order = await prisma.order.findUnique({
            where: { id: data.orderId },
            include: { items: true },
          });
          if (!order) break;

          for (const item of order.items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
            });
          }
          break;
        }
      }
    },
    { ...connection, concurrency: 3 }
  );

  // Notification worker
  new Worker(
    "notifications",
    async (job) => {
      const prisma = (await import("./prisma")).default;
      const data = job.data as NotificationJobData;

      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type as never,
          title: data.title,
          body: data.body,
          link: data.link,
        },
      });
    },
    { ...connection, concurrency: 10 }
  );

  console.log("✅ BullMQ workers started");
}
