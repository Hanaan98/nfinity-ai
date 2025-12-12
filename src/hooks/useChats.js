// src/hooks/useChats.js
import { useState, useEffect, useCallback, useRef } from "react";
import { chatApi, ApiError } from "../services/api";

export function useChats(initialParams = {}) {
  console.log("useChats hook initialized with params:", initialParams);

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChats: 0,
    hasMore: false,
    limit: 20,
  });
  const [filters, setFilters] = useState({
    applied: "all",
    search: "",
    available: ["all", "unread", "active", "closed"],
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    filter: "all",
    search: "",
    customerId: null, // Add customer filtering
    enablePolling: false, // Add polling control
    pollInterval: 5000, // 5 seconds default
    ...initialParams,
  });

  // Polling state
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchChats = useCallback(async (params, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      let response;

      // Use customer-specific endpoint if customerId is provided
      if (params.customerId) {
        console.log(
          "Fetching customer chats for customer ID:",
          params.customerId
        );
        response = await chatApi.getCustomerChats(params.customerId, {
          page: params.page,
          limit: params.limit,
        });
        console.log("Customer chats response:", response);
      } else {
        console.log("Fetching all chats with params:", params);
        // Extract polling params before sending to API
        const {
          enablePolling: _enablePolling,
          pollInterval: _pollInterval,
          ...apiParams
        } = params;
        response = await chatApi.getChats(apiParams);
        console.log("All chats response:", response);
      }

      if (response.success) {
        console.log("Setting chats:", response.data.chats);
        if (mountedRef.current) {
          setChats(response.data.chats);
          setPagination(response.data.pagination);
          setLastUpdated(new Date());
          if (response.data.filters) {
            setFilters(response.data.filters);
          }
        }
      } else {
        throw new Error(response.message || "Failed to fetch chats");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      if (mountedRef.current) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load chats"
        );
        setChats([]);
      }
    } finally {
      if (showLoading && mountedRef.current) setLoading(false);
    }
  }, []);

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

    if (!queryParams.enablePolling || queryParams.pollInterval <= 0) return;

    console.log(`🔄 Starting chat polling every ${queryParams.pollInterval}ms`);

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchChats(queryParams, false); // Don't show loading for polling updates
    }, queryParams.pollInterval);
  }, [fetchChats, queryParams, stopPolling]);

  // Initial fetch and refetch when params change
  useEffect(() => {
    fetchChats(queryParams);
  }, [fetchChats, queryParams]);

  // Start/stop polling when polling params change
  useEffect(() => {
    if (queryParams.enablePolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [
    queryParams.enablePolling,
    queryParams.pollInterval,
    startPolling,
    stopPolling,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      // Clean up polling directly to avoid dependency issues
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty dependency array - run once on mount/unmount only

  // Update query parameters
  const updateParams = useCallback((newParams) => {
    setQueryParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Mark chat as read
  const markAsRead = useCallback(async (sessionId) => {
    try {
      await chatApi.markChatAsRead(sessionId);

      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.sessionId === sessionId ? { ...chat, isRead: true } : chat
        )
      );
    } catch (err) {
      console.error("Error marking chat as read:", err);
      // Optionally show a toast notification here
    }
  }, []);

  // Update customer info
  const updateCustomerInfo = useCallback(async (sessionId, customerData) => {
    try {
      await chatApi.updateCustomerInfo(sessionId, customerData);

      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.sessionId === sessionId
            ? {
                ...chat,
                customer: { ...chat.customer, ...customerData },
                hasCustomerInfo: true,
              }
            : chat
        )
      );
    } catch (err) {
      console.error("Error updating customer info:", err);
      throw err; // Re-throw so calling component can handle
    }
  }, []);

  // Update chat status
  const updateChatStatus = useCallback(async (sessionId, status) => {
    try {
      await chatApi.updateChatStatus(sessionId, status);

      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.sessionId === sessionId ? { ...chat, status: status } : chat
        )
      );
    } catch (err) {
      console.error("Error updating chat status:", err);
      throw err;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchChats(queryParams);
  }, [fetchChats, queryParams]);

  return {
    chats,
    loading,
    error,
    pagination,
    filters,
    queryParams,
    lastUpdated,
    isPolling: intervalRef.current !== null,
    updateParams,
    markAsRead,
    updateCustomerInfo,
    updateChatStatus,
    refresh,
    startPolling,
    stopPolling,
  };
}
