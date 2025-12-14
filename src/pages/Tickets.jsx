// src/pages/Tickets.jsx - Dynamic Tickets List
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks/useTickets";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  Search,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { getAccessToken } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const BTN = `px-2.5 py-1.5 text-xs rounded-md bg-[#1a2126] border border-[#293239] text-gray-300 hover:bg-white/5 transition-colors`;
const borderClass = "border-[#293239]";

function useIndeterminate(checkedSome, checkedAll) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = checkedSome && !checkedAll;
    }
  }, [checkedSome, checkedAll]);
  return ref;
}

// Status pill component
function StatusPill({ status }) {
  const statusMap = {
    open: { bg: "bg-red-500/90", shadow: "shadow-red-500/20", label: "O", text: "Open" },
    pending: { bg: "bg-yellow-500/90", shadow: "shadow-yellow-500/20", label: "P", text: "Pending" },
    in_progress: { bg: "bg-blue-500/90", shadow: "shadow-blue-500/20", label: "W", text: "In Progress" },
    resolved: { bg: "bg-green-500/90", shadow: "shadow-green-500/20", label: "R", text: "Resolved" },
    closed: { bg: "bg-gray-500/90", shadow: "shadow-gray-500/20", label: "C", text: "Closed" },
  };
  const s = statusMap[status] || statusMap.open;
  return (
    <motion.span
      className={`inline-flex items-center justify-center text-[10px] font-semibold leading-none h-5 w-5 rounded shadow-lg ${s.bg} ${s.shadow} text-white`}
      title={s.text}
      whileHover={{ scale: 1.1 }}
      animate={{ 
        boxShadow: ['0 0 0px rgba(0,0,0,0)', '0 0 8px rgba(255,255,255,0.3)', '0 0 0px rgba(0,0,0,0)']
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {s.label}
    </motion.span>
  );
}

// Priority badge
function PriorityBadge({ priority }) {
  const priorityMap = {
    urgent: { color: "text-red-400", bg: "bg-red-500/10", label: "Urgent" },
    high: { color: "text-orange-400", bg: "bg-orange-500/10", label: "High" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Medium" },
    low: { color: "text-gray-400", bg: "bg-gray-500/10", label: "Low" },
  };
  const p = priorityMap[priority] || priorityMap.medium;
  return (
    <motion.span 
      className={`text-xs font-semibold px-2 py-0.5 rounded ${p.color} ${p.bg}`} 
      title={p.label}
      whileHover={{ scale: 1.05 }}
    >
      {p.label}
    </motion.span>
  );
}

export default function Tickets() {
  const navigate = useNavigate();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [checked, setChecked] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tickets with filters
  const { 
    tickets, 
    loading, 
    error, 
    pagination, 
    refresh,
    setStatus: hookSetStatus,
    setPriority: hookSetPriority,
    setSearch: hookSetSearch,
    setPage: hookSetPage,
    setSorting: hookSetSorting
  } = useTickets({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
    sortBy,
    sortOrder,
  });

  // Sync local filters with hook when they change
  useEffect(() => {
    hookSetStatus(statusFilter);
  }, [statusFilter, hookSetStatus]);

  useEffect(() => {
    hookSetPriority(priorityFilter);
  }, [priorityFilter, hookSetPriority]);

  useEffect(() => {
    hookSetSearch(debouncedSearch);
  }, [debouncedSearch, hookSetSearch]);

  useEffect(() => {
    hookSetPage(currentPage);
  }, [currentPage, hookSetPage]);

  useEffect(() => {
    hookSetSorting(sortBy, sortOrder);
  }, [sortBy, sortOrder, hookSetSorting]);

  // Selection helpers
  const pageIds = tickets.map((t) => String(t.id));
  const allOnPageChecked =
    pageIds.length > 0 && pageIds.every((id) => checked[id]);
  const someOnPageChecked =
    pageIds.some((id) => checked[id]) && !allOnPageChecked;
  const headCheckboxRef = useIndeterminate(someOnPageChecked, allOnPageChecked);

  const toggleAllOnPage = (checkedAll) => {
    const next = { ...checked };
    pageIds.forEach((id) => (next[id] = checkedAll));
    setChecked(next);
  };

  const selectedIds = Object.keys(checked).filter((id) => checked[id]);
  const hasSelection = selectedIds.length > 0;

  // Toggle sort
  const toggleSort = (key) => {
    if (sortBy === key) {
      const newOrder = sortOrder === "DESC" ? "ASC" : "DESC";
      setSortOrder(newOrder);
    } else {
      setSortBy(key);
      setSortOrder("DESC");
    }
  };

  // Navigate to ticket details
  const viewTicket = (ticketNumber) => {
    navigate(`/tickets/details?id=${encodeURIComponent(ticketNumber)}`);
  };

  // Clear selection
  const clearSelection = () => setChecked({});

  return (
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100 pl-6 pt-6">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`hidden md:block sticky top-0 self-start h-[calc(100vh-0px)] w-64 pr-6 mr-6 ${borderClass}`}
          style={{ borderRightWidth: 1 }}
        >
          <div className="rounded-lg overflow-hidden h-full">
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-400">
                Tickets
              </h3>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
              />
            </div>

            <nav className="px-4 pb-4 space-y-2">
              <motion.button
                onClick={() => {
                  setStatusFilter("");
                  clearSelection();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  !statusFilter
                    ? "bg-blue-500/40 text-blue-100 border border-blue-500/50 shadow-lg shadow-blue-500/20"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                All Tickets
              </motion.button>

              <motion.button
                onClick={() => {
                  setStatusFilter("open");
                  clearSelection();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === "open"
                    ? "bg-red-500/40 text-red-100 border border-red-500/50 shadow-lg shadow-red-500/20"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                Open Tickets
              </motion.button>

              <motion.button
                onClick={() => {
                  setStatusFilter("pending");
                  clearSelection();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === "pending"
                    ? "bg-yellow-500/40 text-yellow-100 border border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                Pending Tickets
              </motion.button>

              <motion.button
                onClick={() => {
                  setStatusFilter("in_progress");
                  clearSelection();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === "in_progress"
                    ? "bg-blue-500/40 text-blue-100 border border-blue-500/50 shadow-lg shadow-blue-500/20"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                In Progress
              </motion.button>

              <motion.button
                onClick={() => {
                  setStatusFilter("resolved");
                  clearSelection();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === "resolved"
                    ? "bg-green-500/40 text-green-100 border border-green-500/50 shadow-lg shadow-green-500/20"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                Resolved Tickets
              </motion.button>

              <motion.button
                onClick={() => {
                  setStatusFilter("closed");
                  clearSelection();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === "closed"
                    ? "bg-gray-500/40 text-gray-100 border border-gray-500/50 shadow-lg shadow-gray-500/20"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                Closed Tickets
              </motion.button>
            </nav>
          </div>
        </motion.aside>

        {/* Main column */}
        <section className="flex-1 min-w-0 p-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start justify-between mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-blue-400">
                {statusFilter === ""
                  ? "All Tickets"
                  : statusFilter === "open"
                  ? "Open Tickets"
                  : statusFilter === "pending"
                  ? "Pending Tickets"
                  : statusFilter === "in_progress"
                  ? "In Progress Tickets"
                  : statusFilter === "resolved"
                  ? "Resolved Tickets"
                  : statusFilter === "closed"
                  ? "Closed Tickets"
                  : "Tickets"}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                {loading
                  ? "Loading..."
                  : `${pagination.total || 0} total tickets`}
              </p>
            </div>
            <motion.button
              onClick={refresh}
              className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
            >
              <RotateCcw size={16} />
              Refresh
            </motion.button>
          </motion.div>

          {/* Toolbar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            {/* Search */}
            <div className="relative w-full max-w-lg">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                <Search size={18} />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 h-11 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-blue-500/5 font-medium"
                placeholder="Search tickets by order ID or email..."
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 text-gray-300 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all cursor-pointer shadow-lg shadow-blue-500/5 font-semibold text-sm"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Selection actions */}
            {hasSelection && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 hover:from-red-500/30 hover:to-orange-500/30 transition-all shadow-lg shadow-red-500/10 flex items-center gap-2 font-semibold text-sm"
                onClick={clearSelection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 size={14} />
                Clear Selection ({selectedIds.length})
              </motion.button>
            )}
          </motion.div>

          {/* Loading State */}
          {loading && tickets.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={48} className="text-blue-500 mb-4" />
              </motion.div>
              <p className="text-gray-400 font-medium">Loading tickets...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex flex-col items-center justify-center py-12"
            >
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-gray-400 mb-4 font-medium">{error}</p>
              <motion.button 
                onClick={refresh} 
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all shadow-lg shadow-blue-500/10 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* Table */}
          {!loading && !error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 rounded-lg overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-500/10"
            >
              {/* head */}
              <div className="px-4 py-4 text-xs uppercase tracking-wide font-bold text-gray-300 border-b border-blue-500/20 bg-blue-500/10">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-2 flex items-center gap-3">
                    <input
                      ref={headCheckboxRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-blue-500/30 bg-transparent cursor-pointer"
                      aria-label="Select all on page"
                      onChange={(e) => toggleAllOnPage(e.target.checked)}
                      checked={allOnPageChecked}
                    />
                    <span className="text-blue-300">Ticket #</span>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-blue-300">Order ID</div>
                  <div className="col-span-5 md:col-span-5 text-blue-300">Subject</div>
                  <div className="hidden md:block md:col-span-2 text-blue-300">Customer</div>
                  <div className="hidden md:block md:col-span-1 text-right text-blue-300">
                    Updated
                  </div>
                </div>
              </div>

              {/* body */}
              <AnimatePresence>
                <ul className="divide-y divide-blue-500/10">
                  {tickets.map((ticket, index) => (
                    <motion.li
                      key={ticket.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-4 hover:bg-blue-500/10 cursor-pointer transition-all border-blue-500/10"
                      onClick={() => viewTicket(ticket.ticket_number)}
                      whileHover={{ x: 4 }}
                    >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* checkbox + id + status */}
                      <div className="col-span-4 md:col-span-2 flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-blue-500/30 bg-transparent cursor-pointer"
                          checked={!!checked[String(ticket.id)]}
                          onChange={(e) => {
                            e.stopPropagation();
                            setChecked((s) => ({
                              ...s,
                              [ticket.id]: e.target.checked,
                            }));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ticket ${ticket.ticket_number}`}
                        />
                        <StatusPill status={ticket.status} />
                        <span className="truncate text-sm text-blue-400 font-bold">
                          {ticket.ticket_number}
                        </span>
                      </div>

                      {/* shopify order id */}
                      <div className="col-span-3 md:col-span-2 min-w-0">
                        <span className="truncate text-sm text-gray-300 font-medium">
                          {ticket.shopify_order_name ||
                            ticket.shopify_order_id ||
                            "-"}
                        </span>
                      </div>

                      {/* subject */}
                      <div className="col-span-5 md:col-span-5 min-w-0">
                        <span className="truncate text-sm text-gray-200 font-semibold">
                          {ticket.subject}
                        </span>
                      </div>

                      {/* customer */}
                      <div className="hidden md:block md:col-span-2 min-w-0">
                        <span className="truncate text-xs text-gray-400 font-medium">
                          {ticket.customer_email}
                        </span>
                      </div>

                      {/* updated */}
                      <div className="hidden md:block md:col-span-1 text-right">
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(
                            ticket.updatedAt || ticket.updated_at
                          ).toLocaleString([], {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}

                {tickets.length === 0 && !loading && (
                  <motion.li 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-10 text-center text-sm text-gray-400 font-medium"
                  >
                    No tickets found
                  </motion.li>
                )}
              </ul>
              </AnimatePresence>

              {/* footer / pagination */}
              <div className="px-4 py-4 flex items-center justify-between border-t border-blue-500/20 bg-blue-500/5">
                <p className="text-xs text-gray-400 font-medium">
                  Showing {tickets.length} of {pagination.total || 0} tickets
                </p>
                <div className="flex items-center gap-3">
                  <motion.button
                    className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                      currentPage === 1 
                        ? "opacity-40 cursor-not-allowed bg-gray-500/10 text-gray-500" 
                        : "bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 shadow-lg shadow-blue-500/10"
                    }`}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    Prev
                  </motion.button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1)
                      .filter(page => {
                        const total = pagination.totalPages || 1;
                        if (total <= 7) return true;
                        if (page === 1 || page === total) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="text-xs text-gray-500 px-1">...</span>
                            )}
                            <motion.button
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[32px] h-8 rounded-lg font-bold text-xs transition-all ${
                                currentPage === page
                                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                  : "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {page}
                            </motion.button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <motion.button
                    className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                      currentPage === pagination.totalPages
                        ? "opacity-40 cursor-not-allowed bg-gray-500/10 text-gray-500"
                        : "bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 shadow-lg shadow-blue-500/10"
                    }`}
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages || 1, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    whileHover={currentPage !== pagination.totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== pagination.totalPages ? { scale: 0.95 } : {}}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
