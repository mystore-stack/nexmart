// src/workers/index.ts
// Run this separately: npm run queue:worker
// In production: docker-compose runs this as "worker" service

import { startWorkers } from "@/lib/queues";

console.log("🚀 Starting NexMart Queue Workers...");
console.log(`   ENV: ${process.env.NODE_ENV}`);
console.log(`   Redis: ${process.env.REDIS_URL || "redis://localhost:6379"}`);

startWorkers();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received: closing workers");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received: closing workers");
  process.exit(0);
});
