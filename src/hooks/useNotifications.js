// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notificationService";
import { useAuth } from "../auth/AuthProvider";

/**
 * Hook for managing notifications with real-time updates
 * Handles both WebSocket notifications (for tickets) and REST API calls
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Initialize connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        console.log("🔌 Connecting to notification service...");
        notificationService.connect(token);
      }
    }

    return () => {
      // Don't disconnect immediately as other components might be using it
      // The service will handle cleanup when the user logs out
    };
  }, [isAuthenticated, user]);

  // Set up event listeners
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log("📨 New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permission granted
      if (
        notification.priority === "urgent" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: `notification-${notification.id}`,
        });
      }
    };

    const handleUnreadCount = (count) => {
      console.log("📊 Unread count updated:", count);
      setUnreadCount(count);
    };

    const handleConnectionStatus = (connected) => {
      console.log(
        "🔗 Connection status:",
        connected ? "Connected" : "Disconnected"
      );
      setIsConnected(connected);
    };

    const handleNotificationUpdate = (data) => {
      console.log("📝 Notification updated:", data);

      if (data.type === "marked_read") {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === data.notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else if (data.type === "marked_all_read") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else if (data.type === "deleted") {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== data.notificationId)
        );
        // Don't update unread count here as it depends on whether the deleted notification was read
      } else if (data.type === "cleared_read") {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        // Unread count should remain the same as we only removed read notifications
      }
    };

    const handleNotificationsFetched = ({
      notifications: fetchedNotifications,
    }) => {
      setNotifications(fetchedNotifications);
      setError(null);
    };

    const handleNotificationError = (errorMessage) => {
      setError(errorMessage);
    };

    // Subscribe to events
    notificationService.on("notification", handleNewNotification);
    notificationService.on("unreadCount", handleUnreadCount);
    notificationService.on("connected", handleConnectionStatus);
    notificationService.on("notificationUpdate", handleNotificationUpdate);
    notificationService.on("notificationsFetched", handleNotificationsFetched);
    notificationService.on("notificationError", handleNotificationError);

    return () => {
      // Cleanup listeners
      notificationService.off("notification", handleNewNotification);
      notificationService.off("unreadCount", handleUnreadCount);
      notificationService.off("connected", handleConnectionStatus);
      notificationService.off("notificationUpdate", handleNotificationUpdate);
      notificationService.off(
        "notificationsFetched",
        handleNotificationsFetched
      );
      notificationService.off("notificationError", handleNotificationError);
    };
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const result = await notificationService.fetchNotifications(
          page,
          limit
        );
        return result;
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationService.fetchUnreadCount();
      return count;
    } catch (err) {
      console.error("Error fetching unread count:", err);
      throw err;
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw err;
    }
  }, []);

  // Clear all read notifications
  const clearAllRead = useCallback(async () => {
    try {
      await notificationService.clearAllReadNotifications();
    } catch (err) {
      console.error("Error clearing read notifications:", err);
      throw err;
    }
  }, []);

  // Get notification stats
  const getStats = useCallback(async () => {
    try {
      return await notificationService.fetchNotificationStats();
    } catch (err) {
      console.error("Error fetching notification stats:", err);
      throw err;
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    getStats,
    requestNotificationPermission,

    // Service reference for advanced usage
    notificationService,
  };
};

export default useNotifications;
