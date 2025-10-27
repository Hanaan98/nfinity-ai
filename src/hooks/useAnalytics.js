// src/hooks/useAnalytics.js
import { useState, useCallback, useEffect } from "react";
import { getAccessToken } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      setError(null);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getDashboard = useCallback(
    async (startDate, endDate) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const data = await makeRequest(
          `/analytics/dashboard?${params.toString()}`
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const getRecentActivity = useCallback(
    async (limit = 10) => {
      setLoading(true);
      try {
        const data = await makeRequest(
          `/analytics/recent-activity?limit=${limit}`
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const getChatsPerDay = useCallback(
    async (startDate, endDate) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const data = await makeRequest(
          `/analytics/chats-per-day?${params.toString()}`
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const getRevenueFromOrders = useCallback(
    async (startDate, endDate) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const data = await makeRequest(
          `/analytics/revenue-from-orders?${params.toString()}`
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const getCustomersStats = useCallback(
    async (startDate, endDate) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const data = await makeRequest(
          `/analytics/customers?${params.toString()}`
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const getPerformanceMetrics = useCallback(
    async (startDate, endDate) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const data = await makeRequest(
          `/analytics/performance?${params.toString()}`
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  return {
    loading,
    error,
    getDashboard,
    getRecentActivity,
    getChatsPerDay,
    getRevenueFromOrders,
    getCustomersStats,
    getPerformanceMetrics,
  };
};
