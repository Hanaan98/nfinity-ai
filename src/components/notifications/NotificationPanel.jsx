import React, { useEffect, useRef, useState } from "react";
import NotificationItem from "./NotificationItem";
import LoadingSpinner from "../LoadingSpinner";
import useNotifications from "../../hooks/useNotifications";

const NotificationPanel = ({ onClose, isOpen }) => {
  const panelRef = useRef(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Use the centralized notifications hook
  const { notifications, loading, error, fetchNotifications, markAsRead } =
    useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen && !hasFetched) {
      // Only fetch notifications once when panel first opens
      setHasFetched(true);
      fetchNotifications().catch(console.error);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, hasFetched]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset fetch flag when panel closes
  useEffect(() => {
    if (!isOpen) {
      setHasFetched(false);
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      onClose();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking as read:", error);
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
                onClick={() => {
                  setHasFetched(false);
                  fetchNotifications();
                }}
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
