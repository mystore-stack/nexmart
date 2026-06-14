// src/lib/queues/event-processing.queue.ts
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

export const eventQueue = disabledQueue;
export const eventWorker = disabledWorker;
