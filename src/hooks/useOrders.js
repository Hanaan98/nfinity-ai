// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from "react";
import { chatApi, ApiError } from "../services/api";

export function useOrders(initialParams = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasMore: false,
    limit: 20,
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "CREATED_AT", // Shopify sortKey format
    sortOrder: "desc", // "asc" | "desc"
    tag: "ai-order", // Only fetch AI-generated orders
    ...initialParams,
  });

  const fetchOrders = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      let response;

      // Map frontend sort params to Shopify format
      const sortKey = params.sortBy || "CREATED_AT";
      const reverse = params.sortOrder === "desc";

      // Use tag-specific endpoint (required for AI orders)
      response = await chatApi.getOrdersByTag(params.tag, {
        page: params.page,
        limit: params.limit,
        search: params.search,
        sortKey: sortKey, // Shopify format
        reverse: reverse, // Shopify uses reverse instead of sortOrder
      });

      if (response.success) {
        console.log("Orders API Response:", response);

        const ordersData = response.data.orders || response.data || [];
        const paginationData =
          response.data.pagination || response.pagination || {};

        setOrders(ordersData);

        // Better pagination handling
        const currentPage = params.page || 1;
        const totalOrders =
          paginationData.total ||
          paginationData.totalOrders ||
          ordersData.length;
        const limit = params.limit || 20;
        const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

        setPagination({
          currentPage: currentPage,
          totalPages: totalPages,
          totalOrders: totalOrders,
          hasMore: currentPage < totalPages,
          limit: limit,
        });

        console.log("Processed pagination:", {
          currentPage,
          totalPages,
          totalOrders,
          hasMore: currentPage < totalPages,
          limit,
        });
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and refetch when params change
  useEffect(() => {
    fetchOrders(queryParams);
  }, [fetchOrders, queryParams]);

  // Update query parameters
  const updateParams = useCallback((newParams) => {
    setQueryParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      await chatApi.updateOrderStatus(orderId, status);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId || order.orderNumber === orderId
            ? { ...order, status: status }
            : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchOrders(queryParams);
  }, [fetchOrders, queryParams]);

  return {
    orders,
    loading,
    error,
    pagination,
    queryParams,
    updateParams,
    updateOrderStatus,
    refresh,
  };
}
