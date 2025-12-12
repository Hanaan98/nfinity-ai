// src/hooks/useCustomer.js
import { useState, useEffect, useCallback } from "react";
import { chatApi, ApiError } from "../services/api";

export function useCustomer(customerId) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomer = useCallback(async (id) => {
    if (!id) {
      setCustomer(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await chatApi.getCustomer(id);

      if (response.success) {
        setCustomer(response.data.customer);
      } else {
        throw new Error(response.message || "Failed to fetch customer");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load customer"
      );
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomer(customerId);
  }, [fetchCustomer, customerId]);

  const updateCustomer = useCallback(
    async (customerData) => {
      try {
        await chatApi.updateCustomer(customerId, customerData);
        setCustomer((prev) => ({ ...prev, ...customerData }));
      } catch (err) {
        throw err;
      }
    },
    [customerId]
  );

  const refresh = useCallback(() => {
    fetchCustomer(customerId);
  }, [fetchCustomer, customerId]);

  return {
    customer,
    loading,
    error,
    updateCustomer,
    refresh,
  };
}
