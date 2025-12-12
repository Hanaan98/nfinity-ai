// src/pages/Customers.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import {
  CustomerListSkeleton,
  ErrorState,
  EmptyState,
  Spinner,
} from "../components/LoadingStates";

const COLORS = {
  page: "#151a1e",
  card: "#1d2328",
  border: "#293239",
};

const CARD = `bg-[${COLORS.card}] border border-[${COLORS.border}] rounded-lg`;
const ROW_DIV = `divide-y divide-[${COLORS.border}]`;
const BTN = `px-2.5 py-1.5 text-xs rounded-md bg-[#1a2126] border border-[#293239] text-gray-300 hover:bg-white/5`;
const CHIP = `inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-gray-300 border border-[#293239]`;

const borderClass = "border-[#293239]";

export default function Customers() {
  // API state
  const { customers, loading, error, pagination, updateParams, refresh } =
    useCustomers();

  // UI state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("DESC"); // "ASC" | "DESC"

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Update API params when filters or debounced query changes
  useEffect(() => {
    updateParams({
      page: 1,
      search: debouncedQuery,
      status: statusFilter === "all" ? "all" : statusFilter,
      order: sortOrder,
    });
  }, [debouncedQuery, statusFilter, sortOrder, updateParams]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  const toggleSort = () => setSortOrder((s) => (s === "ASC" ? "DESC" : "ASC"));

  // Use customers directly from backend (already sorted)
  const displayCustomers = customers || [];

  if (error) {
    return (
      <div className="w-full min-h-full bg-[#151a1e] text-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️ Error loading customers</div>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={refresh}
              className={`${BTN} bg-red-900/20 border-red-800 text-red-200 hover:bg-red-900/30`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100">
      <div className="flex">
        {/* Left sticky rail */}
        <aside
          className={`hidden md:block sticky top-0 self-start h-[calc(100vh-0px)] w-64 pr-6 mr-6 ${borderClass}`}
          style={{ borderRightWidth: 1 }}
        >
          <div className="rounded-lg overflow-hidden h-full">
            <div className="px-4 py-3 text-sm font-semibold text-gray-300">
              Customer lists
            </div>

            <nav className="px-4 pb-4 space-y-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "all"
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                All customers
              </button>

              <button
                onClick={() => setStatusFilter("active")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "active"
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                Active customers
              </button>

              <button
                onClick={() => setStatusFilter("inactive")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "inactive"
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                Inactive customers
              </button>

              <button
                onClick={() => setStatusFilter("blocked")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "blocked"
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                Blocked users
              </button>
            </nav>

            <div className="mt-auto px-4 py-3 text-xs text-gray-500">
              Connected to API endpoint
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Customers</h1>
              <p className="mt-1 text-sm text-gray-400">
                Search and manage your customers. Click on names to view
                details.
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-lg">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-3 h-10 rounded-md bg-[#1d2328] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Search by name, email, or tag…"
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={refresh}
              className="px-3 h-10 text-xs rounded-md border border-[#293239] bg-[#1a2126] text-gray-300 hover:bg-white/5 flex items-center gap-1.5"
              title="Refresh customers"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>

            {/* Sort */}
            <button
              className={BTN}
              onClick={toggleSort}
              title="Toggle sort by name"
            >
              Sort: Name {sortOrder === "ASC" ? "↑" : "↓"}
            </button>
          </div>

          {/* Count */}
          <div className="mt-4 text-sm text-gray-400">
            {pagination.totalCustomers.toLocaleString()} customers
          </div>

          {/* Table */}
          <div className="mt-3 rounded-lg overflow-hidden">
            {/* head */}
            <div
              className={`px-4 py-3 text-xs uppercase tracking-wide text-gray-400 border-b ${borderClass}`}
            >
              <div className="grid grid-cols-12">
                <div className="col-span-3 md:col-span-3 flex items-center gap-3">
                  <button
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 hover:text-gray-200"
                    title="Sort by name"
                  >
                    <span>Name</span>
                    <svg
                      className="w-3 h-3 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6-6 6 6M6 15l6 6 6-6" />
                    </svg>
                  </button>
                </div>
                <div className="col-span-4 md:col-span-4">Email</div>
                <div className="col-span-2 md:col-span-2">Conversations</div>
                <div className="col-span-2 md:col-span-2">Status</div>
                <div className="col-span-1 md:col-span-1">Last Activity</div>
              </div>
            </div>

            {/* body */}
            {loading ? (
              <CustomerListSkeleton rows={8} />
            ) : (
              <ul className={ROW_DIV}>
                {displayCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <CustomerRow customer={customer} />
                  </div>
                ))}

                {!loading && displayCustomers.length === 0 && (
                  <li className="px-6 py-12">
                    <EmptyState
                      title="No customers found"
                      message="No customers match your current search criteria. Try adjusting your search terms or filters."
                      icon={
                        <svg
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      }
                    />
                  </li>
                )}
              </ul>
            )}

            {/* footer / pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-[#293239]">
              <p className="text-xs text-gray-400">
                Showing {displayCustomers.length} customers on this page (Page{" "}
                {pagination.currentPage} of {pagination.totalPages},{" "}
                {pagination.totalCustomers} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  className={`${BTN} ${
                    pagination.currentPage === 1
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Prev
                </button>
                <span className="text-xs text-gray-400">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  className={`${BTN} ${
                    pagination.currentPage === pagination.totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CustomerRow({ customer }) {
  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "CU";
  };

  return (
    <li className="px-4 py-3 hover:bg-white/2">
      <div className="grid grid-cols-12 items-center">
        {/* avatar + name */}
        <div className="col-span-3 md:col-span-3 flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0f1a20] border border-[#293239]">
            <span className="text-xs font-medium text-gray-300">
              {customer.initials || getInitials(customer.name, customer.email)}
            </span>
          </span>
          <Link
            to={`/customers/${customer.id}`}
            className="truncate text-sm text-blue-400 hover:underline cursor-pointer"
          >
            {customer.name || "Unknown"}
          </Link>
        </div>

        {/* email */}
        <div className="col-span-4 md:col-span-4 flex items-center gap-2 min-w-0">
          <Link
            to={`/customers/${customer.id}`}
            className="truncate text-sm text-gray-300 hover:text-blue-400"
          >
            {customer.email}
          </Link>
        </div>

        {/* conversations */}
        <div className="col-span-2 md:col-span-2">
          <span className="text-sm text-gray-300">
            {customer.totalConversations || 0}
          </span>
        </div>

        {/* status */}
        <div className="col-span-2 md:col-span-2">
          <span
            className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
              customer.status === "active"
                ? "bg-green-900/30 text-green-300 border border-green-800"
                : customer.status === "suspended"
                ? "bg-red-900/30 text-red-300 border border-red-800"
                : "bg-gray-900/30 text-gray-300 border border-gray-700"
            }`}
          >
            {customer.status}
          </span>
        </div>

        {/* last activity */}
        <div className="col-span-1 md:col-span-1">
          <span className="text-xs text-gray-400">{customer.lastActivity}</span>
        </div>
      </div>
    </li>
  );
}
