"use client";

import { useEffect, useState } from "react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "email" | "sms" | "failed">("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/admin/notifications?filter=${filter}`, {
        credentials: "include",
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800";
      case "DELIVERED":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "RETRYING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return "📧";
      case "SMS":
        return "📱";
      case "TELEGRAM":
        return "💬";
      default:
        return "📢";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600">View all sent notifications and their delivery status</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("email")}
          className={`px-4 py-2 rounded-lg ${
            filter === "email" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setFilter("sms")}
          className={`px-4 py-2 rounded-lg ${
            filter === "sms" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          SMS
        </button>
        <button
          onClick={() => setFilter("failed")}
          className={`px-4 py-2 rounded-lg ${
            filter === "failed" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Failed
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No notifications found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retry Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {notification.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{getChannelIcon(notification.channel)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{notification.recipient}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        notification.status
                      )}`}
                    >
                      {notification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notification.sentAt
                      ? new Date(notification.sentAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notification.retryCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
