import React from "react";

const NotificationItem = ({ notification, onClick, onMarkAsRead }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-blue-400";
    }
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      className={`
        px-3 py-2 cursor-pointer hover:bg-[#293239] transition-colors text-sm
        ${!notification.isRead ? "bg-[#1f2937]/20" : ""}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm">{notification.emoji || "🔔"}</span>
          <span className="text-[#d8dcde] truncate">{notification.title}</span>
          {!notification.isRead && (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-xs ${getPriorityColor(notification.priority)}`}
          >
            {notification.priority}
          </span>
          <span className="text-xs text-[#6b7280]">
            {notification.timeAgo || "now"}
          </span>
        </div>
      </div>
      {notification.data?.customerEmail && (
        <div className="text-xs text-[#6b7280] mt-1 pl-6">
          {notification.data.customerEmail}
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
