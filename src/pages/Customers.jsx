// src/pages/Customers.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100 pl-6 pt-6">
      <div className="flex">
        {/* Left sticky rail */}
        <motion.aside
          className={`hidden md:block sticky top-0 self-start h-[calc(100vh-0px)] w-64 pr-6 mr-6 ${borderClass}`}
          style={{ borderRightWidth: 1 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-lg overflow-hidden h-full">
            <div className="px-4 py-4 text-sm font-bold text-gray-200 border-b border-[#293239]">
              Customer lists
            </div>

            <nav className="px-4 py-4 space-y-2">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => setStatusFilter("all")}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-md ${
                  statusFilter === "all"
                    ? "bg-gradient-to-br from-blue-900/40 to-blue-800/30 text-blue-200 border border-blue-700/50 shadow-blue-500/20"
                    : "border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5"
                }`}
              >
                All customers
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => setStatusFilter("active")}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-md ${
                  statusFilter === "active"
                    ? "bg-gradient-to-br from-green-900/40 to-green-800/30 text-green-200 border border-green-700/50 shadow-green-500/20"
                    : "border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5"
                }`}
              >
                Active customers
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => setStatusFilter("inactive")}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-md ${
                  statusFilter === "inactive"
                    ? "bg-gradient-to-br from-gray-900/40 to-gray-800/30 text-gray-200 border border-gray-700/50"
                    : "border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5"
                }`}
              >
                Inactive customers
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => setStatusFilter("blocked")}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-md ${
                  statusFilter === "blocked"
                    ? "bg-gradient-to-br from-red-900/40 to-red-800/30 text-red-200 border border-red-700/50 shadow-red-500/20"
                    : "border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5"
                }`}
              >
                Blocked users
              </motion.button>
            </nav>

            <div className="mt-auto px-4 py-3 text-xs text-gray-500 border-t border-[#293239]">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
                />
                Connected to API endpoint
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main column */}
        <section className="flex-1 min-w-0 p-6">
          {/* Header */}
          <motion.div 
            className="flex items-start justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">Customers</h1>
              <p className="mt-2 text-sm text-gray-400">
                Search and manage your customers. Click on names to view
                details.
              </p>
            </div>
          </motion.div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-lg">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-lg bg-gradient-to-br from-[#1d2328] to-[#1a1f24] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                placeholder="Search by name, email, or tag…"
              />
            </div>

            {/* Refresh button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              onClick={refresh}
              className="px-4 h-11 text-xs rounded-lg border border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5 flex items-center gap-2 font-medium shadow-lg transition-all"
              title="Refresh customers"
            >
              <motion.svg
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </motion.svg>
              Refresh
            </motion.button>

            {/* Sort */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${BTN} font-medium`}
              onClick={toggleSort}
              title="Toggle sort by name"
            >
              Sort: Name {sortOrder === "ASC" ? "↑" : "↓"}
            </motion.button>
          </div>

          {/* Count */}
          <motion.div 
            className="mt-4 text-sm font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-blue-400">{pagination.totalCustomers.toLocaleString()}</span>
            <span className="text-gray-400"> customers</span>
          </motion.div>

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
                <AnimatePresence mode="popLayout">
                  {displayCustomers.map((customer, index) => (
                    <CustomerRow key={customer.id} customer={customer} />
                  ))}
                </AnimatePresence>

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
            <motion.div 
              className="px-4 py-4 flex items-center justify-between border-t border-[#293239] bg-[#151a1e]/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-gray-400 font-medium">
                Showing <span className="text-blue-400 font-bold">{displayCustomers.length}</span> customers on this page (Page{" "}
                <span className="text-blue-400">{pagination.currentPage}</span> of <span className="text-blue-400">{pagination.totalPages}</span>,{" "}
                <span className="text-blue-400 font-bold">{pagination.totalCustomers}</span> total)
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: pagination.currentPage > 1 ? 1.05 : 1 }}
                  whileTap={{ scale: pagination.currentPage > 1 ? 0.95 : 1 }}
                  className={`${BTN} ${
                    pagination.currentPage === 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Prev
                </motion.button>
                <span className="text-xs px-3 py-1.5 rounded-lg bg-[#1a2126] border border-[#293239] font-semibold">
                  <span className="text-blue-400">{pagination.currentPage}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-300">{pagination.totalPages}</span>
                </span>
                <motion.button
                  whileHover={{ scale: pagination.currentPage < pagination.totalPages ? 1.05 : 1 }}
                  whileTap={{ scale: pagination.currentPage < pagination.totalPages ? 0.95 : 1 }}
                  className={`${BTN} ${
                    pagination.currentPage === pagination.totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
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
    <motion.li 
      className="px-4 py-4 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent transition-all group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-12 items-center">
        {/* avatar + name */}
        <div className="col-span-3 md:col-span-3 flex items-center gap-3 min-w-0">
          <motion.span 
            whileHover={{ scale: 1.1 }}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg"
          >
            <span className="text-sm font-semibold text-blue-300">
              {customer.initials || getInitials(customer.name, customer.email)}
            </span>
          </motion.span>
          <Link
            to={`/customers/${customer.id}`}
            className="truncate text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
          >
            {customer.name || "Unknown"}
          </Link>
        </div>

        {/* email */}
        <div className="col-span-4 md:col-span-4 flex items-center gap-2 min-w-0">
          <Link
            to={`/customers/${customer.id}`}
            className="truncate text-sm text-gray-300 hover:text-blue-400 transition-colors"
          >
            {customer.email}
          </Link>
        </div>

        {/* conversations */}
        <div className="col-span-2 md:col-span-2">
          <span className="text-sm font-bold text-gray-200">
            {customer.totalConversations || 0}
          </span>
        </div>

        {/* status */}
        <div className="col-span-2 md:col-span-2">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-semibold ${
              customer.status === "active"
                ? "bg-green-900/30 text-green-300 border border-green-800 shadow-green-500/20 shadow-sm"
                : customer.status === "suspended"
                ? "bg-red-900/30 text-red-300 border border-red-800 shadow-red-500/20 shadow-sm"
                : "bg-gray-900/30 text-gray-300 border border-gray-700"
            }`}
          >
            {customer.status}
          </motion.span>
        </div>

        {/* last activity */}
        <div className="col-span-1 md:col-span-1">
          <span className="text-xs text-gray-400 font-medium">{customer.lastActivity}</span>
        </div>
      </div>
    </motion.li>
  );
}
