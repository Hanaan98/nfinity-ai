// src/hooks/useCustomers.js
import { useState, useEffect, useCallback } from "react";
import { chatApi, ApiError } from "../services/api";

export function useCustomers(initialParams = {}) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    hasMore: false,
    limit: 20,
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    status: "all",
    ...initialParams,
  });

  const fetchCustomers = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const response = await chatApi.getCustomers(params);

      if (response.success) {
        setCustomers(response.data.customers);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || "Failed to fetch customers");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        err instanceof ApiError ? err.message : "Failed to load customers"
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and refetch when params change
  useEffect(() => {
    fetchCustomers(queryParams);
  }, [fetchCustomers, queryParams]);

  // Update query parameters
  const updateParams = useCallback((newParams) => {
    setQueryParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Update customer
  const updateCustomer = useCallback(async (customerId, customerData) => {
    try {
      await chatApi.updateCustomer(customerId, customerData);

      // Update local state
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === customerId
            ? { ...customer, ...customerData }
            : customer
        )
      );
    } catch (err) {
      console.error("Error updating customer:", err);
      throw err;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchCustomers(queryParams);
  }, [fetchCustomers, queryParams]);

  return {
    customers,
    loading,
    error,
    pagination,
    queryParams,
    updateParams,
    updateCustomer,
    refresh,
  };
}
