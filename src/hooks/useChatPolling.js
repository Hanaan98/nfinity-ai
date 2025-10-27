// src/hooks/useChatPolling.js
import { useState, useEffect, useCallback, useRef } from "react";
import { chatApi } from "../services/api";
import { notificationService } from "../services/notificationService";
import { useAuth } from "../auth/AuthProvider";

/**
 * Hook for polling chat list updates every 5 seconds
 * As per the integration guide, regular chats should be polled instead of using notifications
 */
export const useChatPolling = (initialParams = {}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { isAuthenticated } = useAuth();

  // Store the polling interval reference
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Default polling parameters
  const defaultParams = {
    page: 1,
    limit: 20,
    filter: "all",
    search: "",
    pollInterval: 5000, // 5 seconds as recommended in the guide
    ...initialParams,
  };

  const [params, setParams] = useState(defaultParams);

  // Fetch chats function
  const fetchChats = useCallback(
    async (fetchParams = params, showLoading = false) => {
      if (!isAuthenticated) return;

      if (showLoading) setLoading(true);
      setError(null);

      try {
        // Extract pollInterval from params before sending to API
        const { pollInterval: _pollInterval, ...apiParams } = fetchParams;
        const response = await chatApi.getChats(apiParams);

        if (mountedRef.current) {
          setChats(response.conversations || []);
          setLastUpdated(new Date());

          // Notify about chat updates via notification service
          notificationService.notifyListeners("chatsUpdated", response);
        }

        return response;
      } catch (err) {
        console.error("Error fetching chats:", err);
        if (mountedRef.current) {
          setError(err.message);
        }
        throw err;
      } finally {
        if (showLoading && mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [params, isAuthenticated]
  );

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      console.log("⏹️ Stopping chat polling");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    stopPolling(); // Clear any existing interval

    if (!isAuthenticated || params.pollInterval <= 0) return;

    console.log(`🔄 Starting chat polling every ${params.pollInterval}ms`);

    // Initial fetch
    fetchChats(params, true);

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchChats(params, false); // Don't show loading for polling updates
    }, params.pollInterval);
  }, [fetchChats, params, isAuthenticated, stopPolling]);

  // Update parameters and restart polling
  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    return fetchChats(params, true);
  }, [fetchChats, params]);

  // Handle real-time chat updates from WebSocket (optional)
  useEffect(() => {
    const handleChatUpdate = (chatData) => {
      console.log("💬 Real-time chat update received:", chatData);

      // Update the specific chat in the list or add if new
      setChats((prev) => {
        const existingIndex = prev.findIndex(
          (chat) =>
            chat.sessionId === chatData.sessionId || chat.id === chatData.id
        );

        if (existingIndex >= 0) {
          // Update existing chat
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...chatData };
          return updated;
        } else {
          // Add new chat at the beginning
          return [chatData, ...prev];
        }
      });

      setLastUpdated(new Date());
    };

    // Listen for real-time chat updates via notification service
    notificationService.on("chatUpdated", handleChatUpdate);

    return () => {
      notificationService.off("chatUpdated", handleChatUpdate);
    };
  }, []);

  // Start/stop polling based on authentication and component mount
  useEffect(() => {
    mountedRef.current = true;

    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [isAuthenticated, startPolling, stopPolling]);

  // Restart polling when parameters change
  useEffect(() => {
    if (isAuthenticated) {
      startPolling();
    }
  }, [params, startPolling, isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Utility functions
  const getChatBySessionId = useCallback(
    (sessionId) => {
      return chats.find((chat) => chat.sessionId === sessionId);
    },
    [chats]
  );

  const getChatsByType = useCallback(
    (type) => {
      return chats.filter((chat) => chat.conversationType === type);
    },
    [chats]
  );

  const getUnreadChats = useCallback(() => {
    return chats.filter((chat) => !chat.isRead);
  }, [chats]);

  const getSupportTickets = useCallback(() => {
    return chats.filter(
      (chat) =>
        chat.conversationType === "support" || chat.contactType === "support"
    );
  }, [chats]);

  // Mark chat as read
  const markChatAsRead = useCallback(async (sessionId) => {
    try {
      await chatApi.markChatAsRead(sessionId);

      // Update local state
      setChats((prev) =>
        prev.map((chat) =>
          chat.sessionId === sessionId ? { ...chat, isRead: true } : chat
        )
      );

      return true;
    } catch (err) {
      console.error("Error marking chat as read:", err);
      throw err;
    }
  }, []);

  // Update chat status
  const updateChatStatus = useCallback(async (sessionId, status) => {
    try {
      await chatApi.updateChatStatus(sessionId, status);

      // Update local state
      setChats((prev) =>
        prev.map((chat) =>
          chat.sessionId === sessionId ? { ...chat, status } : chat
        )
      );

      return true;
    } catch (err) {
      console.error("Error updating chat status:", err);
      throw err;
    }
  }, []);

  return {
    // State
    chats,
    loading,
    error,
    lastUpdated,
    isPolling: intervalRef.current !== null,
    params,

    // Actions
    refresh,
    updateParams,
    startPolling,
    stopPolling,
    markChatAsRead,
    updateChatStatus,

    // Utilities
    getChatBySessionId,
    getChatsByType,
    getUnreadChats,
    getSupportTickets,

    // Raw fetch function for advanced usage
    fetchChats,
  };
};

export default useChatPolling;
