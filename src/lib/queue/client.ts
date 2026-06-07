export const queueClient = {
  async getStats() {
    return {
      enabled: false,
      jobs: 0,
      workers: 0,
    };
  },
};
