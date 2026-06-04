// src/lib/queues.ts
import { Queue, Worker } from "bullmq";
import { redis, isRedisEnabled } from "./redis";

const connection = { connection: redis };

const createQueue = <T = any>(name: string): Queue<T> | null => {
  if (!isRedisEnabled) return null;
  return new Queue<T>(name, connection);
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
  if (!emailQueue) return;
  return emailQueue.add(data.type, data, {
    delay,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

export async function queueOrderJob(data: OrderJobData) {
  if (!orderQueue) return;
  return orderQueue.add(data.type, data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  });
}

export async function queueNotification(data: NotificationJobData) {
  if (!notificationQueue) return;
  return notificationQueue.add("send", data, {
    attempts: 2,
    removeOnComplete: 500,
    removeOnFail: 100,
  });
}

export async function queueAiJob(data: AiJobData) {
  if (!aiQueue) return;
  return aiQueue.add(data.type, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1500 },
    removeOnComplete: 500,
    removeOnFail: 100,
  });
}

// ─── Worker setup (run separately) ──────────────────────────

export function startWorkers() {
  if (!isRedisEnabled) return;

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
          const order = await prisma.order.findFirst({
            where: { id: data.orderId, organizationId: data.organizationId },
            include: { items: true },
          });
          if (!order) break;

          for (const item of order.items) {
            await prisma.product.update({
              where: { id: item.productId, organizationId: order.organizationId },
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

  new Worker(
    "ai",
    async (job) => {
      const data = job.data as AiJobData;

      switch (data.type) {
        case "index_product": {
          const { upsertProductEmbedding } = await import("./ai/commerce");
          await upsertProductEmbedding(data.productId, data.organizationId);
          break;
        }
        case "abandoned_cart": {
          const prisma = (await import("./prisma")).default;
          const cartItems = await prisma.cartItem.findMany({
            where: { userId: data.userId, product: { organizationId: data.organizationId } },
            include: { product: { select: { name: true } } },
            take: 5,
          });
          if (cartItems.length > 0) {
            await prisma.notification.create({
              data: {
                userId: data.userId,
                type: "PROMO",
                title: "Votre panier vous attend",
                body: `Finalisez votre commande: ${cartItems.map((item) => item.product.name).join(", ")}`,
                link: "/cart",
              },
            });
          }
          break;
        }
      }
    },
    { ...connection, concurrency: 2 }
  );

  console.log("✅ BullMQ workers started");
}
