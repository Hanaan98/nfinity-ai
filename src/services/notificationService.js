import { io } from "socket.io-client";
import { chatApi } from "./api";

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnecting = false;
    this.chatPollInterval = null;
    this.unreadCountInterval = null;
  }

  // Connect to Socket.IO server for ticket notifications only
  connect(token) {
    if (this.socket?.connected) {
      console.log("Already connected to notification service");
      return;
    }

    if (this.isConnecting) {
      console.log("Connection already in progress");
      return;
    }

    this.isConnecting = true;

    // Default to localhost:3000, but allow override via environment
    const serverUrl = import.meta.env?.VITE_API_URL || "http://localhost:3000";

    this.socket = io(serverUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to notification service");
      this.isConnecting = false;
      this.requestUnreadCount();
      this.startPolling();
      this.notifyListeners("connected", true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from notification service:", reason);
      this.isConnecting = false;
      this.stopPolling();
      this.notifyListeners("connected", false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      this.isConnecting = false;
      this.notifyListeners("connectionError", error.message);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.startPolling();
      this.notifyListeners("reconnected", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error.message);
    });

    // Listen for ticket notifications only
    this.socket.on("notification", (notification) => {
      console.log("🔔 New ticket notification:", notification);

      // Add timestamp and format for display
      const formattedNotification = {
        ...notification,
        timeAgo: this.formatTimeAgo(notification.createdAt),
        timestamp: new Date(notification.createdAt),
        // Ensure priority is set
        priority: notification.priority || "medium",
        // Add emoji based on type and priority
        emoji: this.getNotificationEmoji(
          notification.type,
          notification.priority
        ),
      };

      this.notifyListeners("notification", formattedNotification);
    });

    // Listen for unread count updates
    this.socket.on("unreadCount", (count) => {
      console.log("📊 Unread count:", count);
      this.notifyListeners("unreadCount", count);
    });

    // Listen for notification updates (when marked as read/deleted)
    this.socket.on("notificationUpdate", (data) => {
      console.log("📝 Notification update:", data);
      this.notifyListeners("notificationUpdate", data);
    });

    // Listen for real-time chat updates (optional)
    this.socket.on("chat_updated", (chatData) => {
      console.log("💬 Chat updated:", chatData);
      this.notifyListeners("chatUpdated", chatData);
    });
  }

  // Start polling for chat updates and unread count
  startPolling() {
    this.stopPolling(); // Clear any existing intervals

    // DISABLED: Commenting out aggressive polling that causes infinite loops
    // Only poll unread count occasionally, not chats or notifications

    // Poll unread count every 60 seconds as backup (reduced frequency)
    this.unreadCountInterval = setInterval(async () => {
      try {
        const { count } = await chatApi.getUnreadNotificationCount();
        this.notifyListeners("unreadCount", count);
      } catch (error) {
        console.error("Error polling unread count:", error);
      }
    }, 60000); // Increased to 60 seconds

    console.log("📡 Started minimal polling for unread count only");
  }

  // Stop all polling
  stopPolling() {
    if (this.chatPollInterval) {
      clearInterval(this.chatPollInterval);
      this.chatPollInterval = null;
    }

    if (this.unreadCountInterval) {
      clearInterval(this.unreadCountInterval);
      this.unreadCountInterval = null;
    }

    console.log("⏹️ Stopped polling");
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      console.log("Disconnecting from notification service");
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.stopPolling();
      this.notifyListeners("connected", false);
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // REST API methods for notifications
  async fetchNotifications(page = 1, limit = 20) {
    try {
      const response = await chatApi.getNotifications({ page, limit });

      // Handle different response structures from the backend
      let notificationsArray = null;

      if (Array.isArray(response)) {
        notificationsArray = response;
      } else if (
        response?.notifications &&
        Array.isArray(response.notifications)
      ) {
        notificationsArray = response.notifications;
      } else if (
        response?.data?.notifications &&
        Array.isArray(response.data.notifications)
      ) {
        notificationsArray = response.data.notifications;
      } else if (response?.data && Array.isArray(response.data)) {
        notificationsArray = response.data;
      } else {
        console.error(
          "❌ Could not find notifications array in response:",
          response
        );
        throw new Error(
          "Invalid response structure: no notifications array found"
        );
      }

      const formattedNotifications = notificationsArray.map((notification) => ({
        ...notification,
        timeAgo: this.formatTimeAgo(notification.createdAt),
        timestamp: new Date(notification.createdAt),
        emoji: this.getNotificationEmoji(
          notification.type,
          notification.priority
        ),
      }));

      this.notifyListeners("notificationsFetched", {
        notifications: formattedNotifications,
        pagination: response.pagination,
      });

      return {
        notifications: formattedNotifications,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      this.notifyListeners("notificationError", error.message);
      throw error;
    }
  }

  async fetchUnreadCount() {
    try {
      const { count } = await chatApi.getUnreadNotificationCount();
      this.notifyListeners("unreadCount", count);
      return count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      await chatApi.markNotificationAsRead(notificationId);
      this.notifyListeners("notificationUpdate", {
        type: "marked_read",
        notificationId,
      });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await chatApi.markAllNotificationsAsRead();
      this.notifyListeners("notificationUpdate", {
        type: "marked_all_read",
        count: response.count,
      });
      this.notifyListeners("unreadCount", 0);
      return response;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      await chatApi.deleteNotification(notificationId);
      this.notifyListeners("notificationUpdate", {
        type: "deleted",
        notificationId,
      });
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  async clearAllReadNotifications() {
    try {
      const response = await chatApi.clearAllReadNotifications();
      this.notifyListeners("notificationUpdate", {
        type: "cleared_read",
        count: response.count,
      });
      return response;
    } catch (error) {
      console.error("Error clearing read notifications:", error);
      throw error;
    }
  }

  async fetchNotificationStats() {
    try {
      return await chatApi.getNotificationStats();
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      throw error;
    }
  }

  // Request current unread count via WebSocket (for initial load)
  requestUnreadCount() {
    if (this.socket?.connected) {
      this.socket.emit("getUnreadCount");
    } else {
      // Fallback to REST API
      this.fetchUnreadCount().catch(console.error);
    }
  }

  // Mark notification as read via WebSocket (for real-time updates)
  markAsRead(notificationId) {
    if (this.socket?.connected) {
      this.socket.emit("markAsRead", notificationId);
    } else {
      // Fallback to REST API
      this.markNotificationAsRead(notificationId).catch(console.error);
    }
  }

  // Mark all notifications as read via WebSocket
  markAllAsRead() {
    if (this.socket?.connected) {
      this.socket.emit("markAllAsRead");
    } else {
      // Fallback to REST API
      this.markAllNotificationsAsRead().catch(console.error);
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in notification listener for ${event}:`, error);
        }
      });
    }
  }

  // Format timestamp to "time ago" string
  formatTimeAgo(timestamp) {
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

  // Get emoji based on notification type and priority
  getNotificationEmoji(type, priority) {
    // Priority-based emojis for urgent notifications
    if (priority === "urgent") {
      switch (type) {
        case "long_wait_time":
          return "⚠️";
        case "new_ticket":
          return "🚨";
        case "chat_escalated":
          return "🔴";
        default:
          return "🚨";
      }
    }

    // Type-based emojis for other priorities
    switch (type) {
      case "new_ticket":
        return "🎫";
      case "chat_escalated":
        return "⬆️";
      case "new_message":
        return "💬";
      case "status_changed":
        return "✅";
      case "order_issue":
        return "📦";
      case "order_update":
        return "📋";
      case "long_wait_time":
        return "⏰";
      case "system_alert":
        return "⚙️";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  }

  // Get priority color class for UI
  getPriorityColorClass(priority) {
    switch (priority) {
      case "urgent":
        return "text-red-600 border-red-500 bg-red-50";
      case "high":
        return "text-orange-600 border-orange-500 bg-orange-50";
      case "medium":
        return "text-yellow-600 border-yellow-500 bg-yellow-50";
      case "low":
        return "text-green-600 border-green-500 bg-green-50";
      default:
        return "text-blue-600 border-blue-500 bg-blue-50";
    }
  }

  // Get priority label for display
  getPriorityLabel(priority) {
    switch (priority) {
      case "urgent":
        return "URGENT";
      case "high":
        return "HIGH";
      case "medium":
        return "MEDIUM";
      case "low":
        return "LOW";
      default:
        return "MEDIUM";
    }
  }

  // Check if notification should play sound
  shouldPlaySound(notification) {
    const soundEnabled = localStorage.getItem("notificationSound") !== "false";
    if (!soundEnabled) return false;

    // Always play sound for urgent notifications
    if (notification.priority === "urgent") return true;

    // Play sound for high priority notifications
    if (notification.priority === "high") return true;

    // For medium and low, check user preference
    const mediumSoundEnabled =
      localStorage.getItem("mediumPrioritySound") !== "false";
    return mediumSoundEnabled;
  }

  // Get notification display title with priority prefix
  getDisplayTitle(notification) {
    const emoji =
      notification.emoji ||
      this.getNotificationEmoji(notification.type, notification.priority);
    const priorityPrefix = notification.priority === "urgent" ? "🚨 " : "";
    return `${priorityPrefix}${emoji} ${notification.title}`;
  }

  // Test notification (for development)
  sendTestNotification(type = "new_message", priority = "medium") {
    if (this.socket?.connected) {
      this.socket.emit("testNotification", { type, priority });
    } else {
      // If not connected, simulate a test notification locally
      const testNotification = {
        id: Date.now(),
        type,
        title: this.getTestTitle(type, priority),
        message: this.getTestMessage(type, priority),
        priority,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: this.getTestData(type),
        actionUrl: "/chats/test-123",
        emoji: this.getNotificationEmoji(type, priority),
      };

      // Add timestamp and format for display
      const formattedNotification = {
        ...testNotification,
        timeAgo: "Just now",
        timestamp: new Date(),
      };

      // Trigger notification locally
      this.notifyListeners("notification", formattedNotification);
    }
  }

  // Helper methods for test notifications
  getTestTitle(type, priority) {
    const urgentPrefix = priority === "urgent" ? "🚨 " : "";

    switch (type) {
      case "new_ticket":
        return `${urgentPrefix}New Support Ticket`;
      case "chat_escalated":
        return `${urgentPrefix}Chat Escalated to Support`;
      case "new_message":
        return `${urgentPrefix}New Customer Message`;
      case "long_wait_time":
        return `${urgentPrefix}Customer Waiting Too Long`;
      case "order_issue":
        return `${urgentPrefix}Order Issue Reported`;
      case "order_update":
        return `${urgentPrefix}Order Status Updated`;
      case "status_changed":
        return `${urgentPrefix}Conversation Status Changed`;
      case "system_alert":
        return `${urgentPrefix}System Alert`;
      default:
        return `${urgentPrefix}Test Notification`;
    }
  }

  getTestMessage(type, priority) {
    switch (type) {
      case "new_ticket":
        return "A customer has submitted a new support ticket and needs assistance.";
      case "chat_escalated":
        return "A chat conversation has been escalated to human support.";
      case "new_message":
        return priority === "medium"
          ? "A customer is asking about their order status."
          : "A new customer has started a conversation.";
      case "long_wait_time":
        return "A customer has been waiting for 35 minutes without a response.";
      case "order_issue":
        return "A customer has reported an issue with their recent order.";
      case "order_update":
        return "Order #12345 status has been updated to 'Shipped'.";
      case "status_changed":
        return "Conversation status changed from 'active' to 'closed'.";
      case "system_alert":
        return "System maintenance is scheduled for tonight at 2 AM EST.";
      default:
        return "This is a test notification to verify the system is working correctly.";
    }
  }

  getTestData(type) {
    switch (type) {
      case "new_ticket":
      case "chat_escalated":
        return {
          sessionId: "test-session-123",
          customerEmail: "customer@example.com",
          contactType: "support",
        };
      case "new_message":
        return {
          sessionId: "test-session-456",
          customerEmail: "customer@example.com",
          conversationType: "order_tracking",
          messagePreview: "Where is my order #12345?",
        };
      case "long_wait_time":
        return {
          sessionId: "test-session-789",
          customerEmail: "waiting@example.com",
          waitTimeMinutes: 35,
          lastMessageAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        };
      case "order_issue":
      case "order_update":
        return {
          orderId: "order-123",
          orderNumber: "#12345",
          customerEmail: "customer@example.com",
        };
      default:
        return {
          sessionId: "test-session-default",
          testType: type,
        };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
