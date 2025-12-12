import React, { useState, useEffect } from "react";
import NotificationPanel from "./NotificationPanel";
import useNotifications from "../../hooks/useNotifications";

const NotificationBell = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const { unreadCount, isConnected, notificationService } = useNotifications();

  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log("Bell received new notification:", notification);
      // Trigger animation for new notification
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 2000);
    };

    // Subscribe to new notifications for animation
    notificationService.on("notification", handleNewNotification);

    return () => {
      notificationService.off("notification", handleNewNotification);
    };
  }, [notificationService]);

  const handleBellClick = () => {
    setShowPanel(!showPanel);
    // Remove new notification animation when panel is opened
    if (!showPanel) {
      setHasNewNotification(false);
    }
  };

  const handleClosePanel = () => {
    setShowPanel(false);
  };

  return (
    <div className="notification-bell relative z-50">
      <button
        onClick={handleBellClick}
        className={`
          relative p-2 text-[#d8dcde] hover:text-[#d8dcdecc] focus:outline-none transition-all duration-200
          ${hasNewNotification ? "animate-bounce" : ""}
          ${showPanel ? "bg-blue-600/20 text-blue-400" : "hover:bg-white/5"}
        `}
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
        title={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
      >
        {/* Bell Icon */}
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            className={`
            absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.2rem] h-4
            ${hasNewNotification ? "animate-pulse" : ""}
          `}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        {!isConnected && (
          <span
            className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-yellow-400 border border-[#151a1e] rounded-full"
            title="Disconnected from notification service"
          />
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <NotificationPanel isOpen={showPanel} onClose={handleClosePanel} />
      )}
    </div>
  );
};

export default NotificationBell;
