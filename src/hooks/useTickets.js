// src/hooks/useTickets.js
import { useState, useEffect, useCallback } from "react";
import { ticketApi } from "../services/ticketService";

/**
 * Custom hook for fetching and managing tickets list
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Tickets data, loading state, error, and filter functions
 */
export function useTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    priority: "",
    issue_type: "",
    search: "",
    sortBy: "created_at",
    sortOrder: "DESC",
    ...initialFilters,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ticketApi.getAllTickets(filters);

      // Handle response format - data is directly an array
      if (response.success) {
        // response.data is the tickets array directly
        const ticketsArray = Array.isArray(response.data)
          ? response.data
          : response.data?.tickets || response.tickets || [];

        setTickets(ticketsArray);
        setPagination(
          response.pagination || {
            page: filters.page,
            limit: filters.limit,
            total: 0,
            totalPages: 0,
          }
        );
      } else {
        throw new Error(response.error || "Failed to fetch tickets");
      }
    } catch (err) {
      setError(err.message || "Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch tickets when filters change
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter functions
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setStatus = useCallback(
    (status) => {
      updateFilters({ status });
    },
    [updateFilters]
  );

  const setPriority = useCallback(
    (priority) => {
      updateFilters({ priority });
    },
    [updateFilters]
  );

  const setSearch = useCallback(
    (search) => {
      updateFilters({ search });
    },
    [updateFilters]
  );

  const setSorting = useCallback((sortBy, sortOrder = "DESC") => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      status: "",
      priority: "",
      issue_type: "",
      search: "",
      sortBy: "created_at",
      sortOrder: "DESC",
    });
  }, []);

  const refresh = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    setStatus,
    setPriority,
    setSearch,
    setSorting,
    resetFilters,
    refresh,
  };
}
