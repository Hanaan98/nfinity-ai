// src/components/notifications/NotificationDemo.jsx
import React, { useState, useEffect } from "react";
import useNotifications from "../../hooks/useNotifications";
import { useChatPolling } from "../../hooks/useChatPolling";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * Demo component showing complete integration with notification endpoints
 * This demonstrates the patterns from the Frontend Integration Guide
 */
const NotificationDemo = () => {
  const navigate = useNavigate();

  // Notification system (for ticket notifications only)
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    requestNotificationPermission,
  } = useNotifications();

  // Chat polling (for regular chat updates)
  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    lastUpdated,
    isPolling,
    refresh: refreshChats,
    getChatsByType,
    getSupportTickets,
    markChatAsRead,
  } = useChatPolling();

  const [selectedTab, setSelectedTab] = useState("notifications");

  // Request browser notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Handle notification clicks
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Show toast
      toast.success(`Opening ${notification.title}`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Navigate to action URL
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
      toast.error("Failed to open notification");
    }
  };

  // Handle chat clicks
  const handleChatClick = async (chat) => {
    try {
      // Mark chat as read if not already
      if (!chat.isRead) {
        await markChatAsRead(chat.sessionId);
      }

      // Navigate to chat
      navigate(`/chats/${chat.sessionId}`);
    } catch (error) {
      console.error("Error opening chat:", error);
      toast.error("Failed to open chat");
    }
  };

  // Get chat statistics
  const supportTickets = getSupportTickets();
  const orderTrackingChats = getChatsByType("order_tracking");
  const generalChats = getChatsByType("general");

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#151a1e] text-[#d8dcde] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📋 Notification System Demo</h1>
        <p className="text-[#6b7280]">
          Complete integration with notification endpoints as per the Frontend
          Integration Guide
        </p>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6b7280]">WebSocket Status</span>
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="text-lg font-semibold mt-1">
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>

        <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6b7280]">Ticket Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="text-lg font-semibold mt-1">
            {notifications.length}
          </div>
        </div>

        <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6b7280]">Chat Polling</span>
            <div
              className={`w-3 h-3 rounded-full ${
                isPolling ? "bg-green-500 animate-pulse" : "bg-gray-500"
              }`}
            />
          </div>
          <div className="text-lg font-semibold mt-1">
            {isPolling ? "Active" : "Stopped"}
          </div>
        </div>

        <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6b7280]">Total Chats</span>
            <button
              onClick={refreshChats}
              className="text-blue-400 hover:text-blue-300 text-sm"
              disabled={chatsLoading}
            >
              {chatsLoading ? "⟳" : "↻"}
            </button>
          </div>
          <div className="text-lg font-semibold mt-1">{chats.length}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-[#1d2328] border border-[#293239] rounded-lg p-1">
        <button
          onClick={() => setSelectedTab("notifications")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === "notifications"
              ? "bg-blue-600 text-white"
              : "text-[#6b7280] hover:text-[#d8dcde] hover:bg-[#293239]"
          }`}
        >
          🎫 Ticket Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setSelectedTab("chats")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === "chats"
              ? "bg-blue-600 text-white"
              : "text-[#6b7280] hover:text-[#d8dcde] hover:bg-[#293239]"
          }`}
        >
          💬 All Chats ({chats.length})
        </button>
        <button
          onClick={() => setSelectedTab("stats")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === "stats"
              ? "bg-blue-600 text-white"
              : "text-[#6b7280] hover:text-[#d8dcde] hover:bg-[#293239]"
          }`}
        >
          📊 Statistics
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Support Ticket Notifications
            </h2>
            <div className="space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={notificationsLoading}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAllRead}
                disabled={notificationsLoading}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white text-sm rounded"
              >
                Clear Read
              </button>
            </div>
          </div>

          {notificationsError && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded">
              {notificationsError}
            </div>
          )}

          {notificationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-[#6b7280]">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280]">
              <div className="text-4xl mb-2">🎫</div>
              <p>No ticket notifications</p>
              <p className="text-sm mt-1">
                New support tickets will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    notification.isRead
                      ? "bg-[#1d2328] border-[#293239] opacity-60"
                      : "bg-[#1d2328] border-blue-500 hover:bg-[#293239]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{notification.emoji}</span>
                        <h3 className="font-semibold">{notification.title}</h3>
                        {notification.priority === "urgent" && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[#6b7280] mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-2">
                        {notification.timeAgo}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === "chats" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              All Chats (Updated every 5s)
            </h2>
            <div className="text-sm text-[#6b7280]">
              {lastUpdated &&
                `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </div>
          </div>

          {chatsError && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded">
              {chatsError}
            </div>
          )}

          {chatsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-[#6b7280]">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280]">
              <div className="text-4xl mb-2">💬</div>
              <p>No active chats</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id || chat.sessionId}
                  onClick={() => handleChatClick(chat)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    chat.isRead
                      ? "bg-[#1d2328] border-[#293239]"
                      : "bg-[#1d2328] border-green-500 hover:bg-[#293239]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {chat.conversationType === "support"
                            ? "🎫"
                            : chat.conversationType === "order_tracking"
                            ? "📦"
                            : "💬"}
                        </span>
                        <h3 className="font-semibold">
                          {chat.customerEmail || "Anonymous Customer"}
                        </h3>
                        <span className="text-xs bg-[#293239] px-2 py-1 rounded">
                          {chat.conversationType || "general"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            chat.status === "active"
                              ? "bg-green-600"
                              : chat.status === "closed"
                              ? "bg-gray-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {chat.status || "active"}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-2">
                        Last message:{" "}
                        {new Date(chat.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                    {!chat.isRead && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === "stats" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Statistics Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎫 Support Tickets</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Notifications:</span>
                  <span className="font-mono">{notifications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unread:</span>
                  <span className="font-mono text-red-400">{unreadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Support Chats:</span>
                  <span className="font-mono">{supportTickets.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💬 Chat Types</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Chats:</span>
                  <span className="font-mono">{chats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Tracking:</span>
                  <span className="font-mono">{orderTrackingChats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>General:</span>
                  <span className="font-mono">{generalChats.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📡 System Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>WebSocket:</span>
                  <span
                    className={`font-mono ${
                      isConnected ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chat Polling:</span>
                  <span
                    className={`font-mono ${
                      isPolling ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isPolling ? "Active" : "Stopped"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="font-mono text-xs">
                    {lastUpdated?.toLocaleTimeString() || "Never"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              🔧 Integration Guide Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">
                  ✅ Notifications (Tickets Only)
                </h4>
                <ul className="space-y-1 text-[#6b7280]">
                  <li>• WebSocket for real-time ticket notifications</li>
                  <li>• REST API for notification management</li>
                  <li>• Browser notifications for urgent tickets</li>
                  <li>• Mark as read/delete functionality</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">
                  🔄 Chat Updates
                </h4>
                <ul className="space-y-1 text-[#6b7280]">
                  <li>• Polling /chat/all every 5 seconds</li>
                  <li>• No notifications for regular chats</li>
                  <li>• Real-time updates via WebSocket (optional)</li>
                  <li>• Automatic status management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDemo;
