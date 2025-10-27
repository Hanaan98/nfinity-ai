import React, { useState, useEffect, useRef, useCallback } from "react";
import NotificationItem from "./NotificationItem";
import LoadingSpinner from "../LoadingSpinner";
import { useAuth } from "../../auth/AuthProvider";
import { notificationService } from "../../services/notificationService";

const NotificationPanel = ({ onClose, isOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      // Use the notification service to fetch notifications
      const { notifications: fetchedNotifications } =
        await notificationService.fetchNotifications(1, 20);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);

      // For development, show mock notifications if backend is not available
      if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("not available") ||
        error.message.includes("Failed to fetch")
      ) {
        console.log(
          "Backend not available, showing mock notifications for development"
        );
        setNotifications(getMockNotifications());
        setError(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Listen for notification updates
    const handleNotificationUpdate = (data) => {
      if (data.type === "marked_read") {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === data.notificationId ? { ...n, isRead: true } : n
          )
        );
      } else if (data.type === "marked_all_read") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } else if (data.type === "deleted") {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== data.notificationId)
        );
      } else if (data.type === "cleared_read") {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
      }
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20)); // Keep only latest 20
    };

    if (isOpen) {
      fetchNotifications();
      document.addEventListener("mousedown", handleClickOutside);

      // Subscribe to notification updates
      notificationService.on("notificationUpdate", handleNotificationUpdate);
      notificationService.on("notification", handleNewNotification);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      notificationService.off("notificationUpdate", handleNotificationUpdate);
      notificationService.off("notification", handleNewNotification);
    };
  }, [isOpen, onClose, fetchNotifications]);

  // Mock notifications for development when backend is not available
  const getMockNotifications = () => {
    const now = new Date();
    return [
      {
        id: 1,
        type: "long_wait_time",
        title: "⚠️ Customer Waiting Too Long",
        message:
          "customer@example.com has been waiting for 35 minutes without a response",
        priority: "urgent",
        isRead: false,
        createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
        timeAgo: "5 minutes ago",
        timestamp: new Date(now - 5 * 60 * 1000),
        data: {
          customerEmail: "customer@example.com",
          waitTimeMinutes: 35,
          sessionId: "session-123",
        },
        actionUrl: "/chats/session-123",
        emoji: "⚠️",
      },
      {
        id: 2,
        type: "new_ticket",
        title: "New Support Ticket",
        message: "support@example.com needs assistance with their recent order",
        priority: "high",
        isRead: false,
        createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
        timeAgo: "15 minutes ago",
        timestamp: new Date(now - 15 * 60 * 1000),
        data: {
          customerEmail: "support@example.com",
          contactType: "support",
          sessionId: "session-456",
        },
        actionUrl: "/chats/session-456",
        emoji: "🎫",
      },
      {
        id: 3,
        type: "new_message",
        title: "Order Tracking Inquiry",
        message: "order@example.com is asking about order #12345 status",
        priority: "medium",
        isRead: true,
        createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
        timeAgo: "45 minutes ago",
        timestamp: new Date(now - 45 * 60 * 1000),
        data: {
          customerEmail: "order@example.com",
          conversationType: "order_tracking",
          sessionId: "session-789",
        },
        actionUrl: "/chats/session-789",
        emoji: "💬",
      },
      {
        id: 4,
        type: "status_changed",
        title: "Conversation Resolved",
        message: "Chat with general@example.com has been marked as resolved",
        priority: "low",
        isRead: true,
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        timeAgo: "2 hours ago",
        timestamp: new Date(now - 2 * 60 * 60 * 1000),
        data: {
          customerEmail: "general@example.com",
          oldStatus: "active",
          newStatus: "closed",
          sessionId: "session-101",
        },
        actionUrl: "/chats/session-101",
        emoji: "✅",
      },
    ];
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Use notification service for marking as read
      await notificationService.markNotificationAsRead(notificationId);
      // The state update will be handled by the event listener
    } catch (error) {
      console.error("Error marking as read:", error);
      // Fallback: update local state directly
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to action URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="notification-panel absolute top-12 right-0 w-80 max-h-64 bg-[#1d2328] border border-[#293239] rounded-lg shadow-xl z-50">
      <div ref={panelRef} className="flex flex-col h-full">
        {/* Panel Header - Minimal */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#293239]">
          <h3 className="text-sm font-medium text-[#d8dcde]">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#d8dcde] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Panel Body - Minimal */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-xs text-[#6b7280]">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-3 text-center">
              <div className="text-red-400 text-xs">
                Error loading notifications
              </div>
              <button
                onClick={fetchNotifications}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300"
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#6b7280]">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-[#293239]">
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel Footer - Minimal */}
        {notifications.length > 5 && (
          <div className="px-3 py-2 border-t border-[#293239] text-center">
            <a
              href="/notifications"
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={onClose}
            >
              View all
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
