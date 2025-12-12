/**
 * Message Helper Utilities
 * Centralized functions for parsing and formatting messages
 */

/**
 * Parse latest message from chat object
 * Handles different response formats from backend
 * @param {Object} chat - Chat object with latestMessage property
 * @returns {string} - Parsed message text
 */
export function parseLatestMessage(chat) {
  const fallback = `${chat.conversationType || "Chat"} conversation`;

  if (!chat.latestMessage) return fallback;

  // Handle string format
  if (typeof chat.latestMessage === "string") {
    return chat.latestMessage;
  }

  // Handle object format with multiple possible properties
  return (
    chat.latestMessage.fullContent ||
    chat.latestMessage.content ||
    chat.latestMessage.text ||
    fallback
  );
}

/**
 * Format timestamp to "time ago" string
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} - Formatted time ago string
 */
export function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return time.toLocaleDateString();
  }
}

/**
 * Truncate message to specified length
 * @param {string} message - Message text
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} - Truncated message with ellipsis if needed
 */
export function truncateMessage(message, maxLength = 100) {
  if (!message) return "";
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength).trim() + "...";
}

/**
 * Convert chat to activity format for dashboard display
 * @param {Object} chat - Chat object from API
 * @returns {Object} - Formatted activity object
 */
export function chatToActivity(chat) {
  const messageText = parseLatestMessage(chat);

  return {
    id: chat.id || chat.sessionId,
    type: chat.conversationType || "chat",
    customerName: chat.customerEmail || "Anonymous Customer",
    customer: chat.customerEmail || "Anonymous",
    timestamp: chat.lastMessageAt || chat.createdAt,
    timeAgo: formatTimeAgo(chat.lastMessageAt || chat.createdAt),
    sessionId: chat.sessionId,
    status: chat.status || "active",
    conversationType: chat.conversationType,
    messagePreview: messageText,
    latestMessage: messageText,
  };
}
