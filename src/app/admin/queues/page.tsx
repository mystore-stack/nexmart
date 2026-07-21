"use client";

import { useEffect, useState } from "react";

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export default function AdminQueuesPage() {
  const [queues, setQueues] = useState<QueueStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueueStats();
    const interval = setInterval(fetchQueueStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueStats = async () => {
    try {
      const response = await fetch("/api/admin/queues/stats");
      const data = await response.json();
      setQueues(data.queues || []);
    } catch (error) {
      console.error("Failed to fetch queue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (queue: QueueStats) => {
    if (queue.failed > 10) return "bg-red-100 text-red-800";
    if (queue.waiting > 100) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Queue Monitoring</h1>
        <p className="text-gray-600">Real-time queue statistics and job monitoring</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : queues.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No queues found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {queues.map((queue) => (
            <div key={queue.name} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4 capitalize">{queue.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Waiting</span>
                  <span className="font-medium">{queue.waiting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium">{queue.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{queue.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-medium text-red-600">{queue.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delayed</span>
                  <span className="font-medium">{queue.delayed}</span>
                </div>
              </div>
              <div className={`mt-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(queue)}`}>
                {queue.failed > 10 ? "Critical" : queue.waiting > 100 ? "High Load" : "Healthy"}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Queue Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Email Queue</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Max attempts: 5</li>
              <li>• Backoff: Exponential (5s)</li>
              <li>• Concurrency: 5</li>
              <li>• Retention: 24h (completed), 7d (failed)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">SMS Queue</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Max attempts: 5</li>
              <li>• Backoff: Exponential (5s)</li>
              <li>• Concurrency: 3</li>
              <li>• Retention: 24h (completed), 7d (failed)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Notification Queue</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Max attempts: 3</li>
              <li>• Backoff: Exponential (3s)</li>
              <li>• Concurrency: 10</li>
              <li>• Retention: 24h (completed), 7d (failed)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Analytics Queue</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Max attempts: 3</li>
              <li>• Backoff: Exponential (2s)</li>
              <li>• Concurrency: 5</li>
              <li>• Retention: 7d (completed), 7d (failed)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
