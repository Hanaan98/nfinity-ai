import React, { useState, useEffect, useCallback } from "react";
import { NotificationItem } from "../components/notifications";
import LoadingSpinner from "../components/LoadingSpinner";
import { chatApi } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Helper: format timestamps to a human string
  function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return time.toLocaleDateString();
    }
  }

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setLoading(pageNum === 1);
    setError(null);

    try {
      // Use chatApi which wraps auth, error handling and the correct endpoints
      const result = await chatApi.getNotifications({
        page: pageNum,
        limit: 20,
      });

      // Support multiple response shapes from different backends
      let notificationsData = [];
      let pagination = { hasNext: false };

      if (result == null) {
        throw new Error("Empty response from notifications API");
      }

      if (Array.isArray(result)) {
        notificationsData = result;
      } else if (result.notifications) {
        notificationsData = result.notifications;
        pagination = result.pagination || pagination;
      } else if (result.data && result.data.notifications) {
        notificationsData = result.data.notifications;
        pagination = result.data.pagination || pagination;
      } else if (result.data && Array.isArray(result.data)) {
        notificationsData = result.data;
      }

      const formattedNotifications = (notificationsData || []).map(
        (notification) => ({
          ...notification,
          timeAgo: formatTimeAgo(notification.createdAt),
          timestamp: new Date(notification.createdAt),
        })
      );

      if (pageNum === 1) {
        setNotifications(formattedNotifications);
      } else {
        setNotifications((prev) => [...prev, ...formattedNotifications]);
      }

      setHasMore(Boolean(pagination.hasNext));
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error?.userMessage || error.message || String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, filter);
  }, [filter, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await chatApi.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await chatApi.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearRead = async () => {
    try {
      await chatApi.clearAllReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error("Error clearing read notifications:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, filter);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.isRead;
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">
          Stay updated with your latest notifications and alerts
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === "unread"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={handleClearRead}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              >
                Clear read
              </button>
              <button
                onClick={() => fetchNotifications(1, filter)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-500">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium">
                Error loading notifications
              </h3>
            </div>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => fetchNotifications(1, filter)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-400">
              {filter === "unread"
                ? "All caught up! Check back later for new notifications."
                : "Notifications will appear here when you receive them."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load more notifications"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
