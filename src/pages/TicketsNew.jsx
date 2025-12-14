// src/pages/TicketsNew.jsx - Dynamic Tickets List
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
    open: { bg: "bg-red-500", label: "O", text: "Open" },
    pending: { bg: "bg-yellow-500", label: "P", text: "Pending" },
    in_progress: { bg: "bg-blue-500", label: "W", text: "In Progress" },
    resolved: { bg: "bg-green-500", label: "R", text: "Resolved" },
    closed: { bg: "bg-gray-500", label: "C", text: "Closed" },
  };
  const s = statusMap[status] || statusMap.open;
  return (
    <span
      className={`inline-flex items-center justify-center text-[10px] leading-none h-4 w-4 rounded ${s.bg} text-white`}
      title={s.text}
    >
      {s.label}
    </span>
  );
}

// Priority badge
function PriorityBadge({ priority }) {
  const priorityMap = {
    urgent: { color: "text-red-400", label: "Urgent" },
    high: { color: "text-orange-400", label: "High" },
    medium: { color: "text-yellow-400", label: "Medium" },
    low: { color: "text-gray-400", label: "Low" },
  };
  const p = priorityMap[priority] || priorityMap.medium;
  return (
    <span className={`text-xs ${p.color}`} title={p.label}>
      {p.label}
    </span>
  );
}

export default function Tickets() {
  const navigate = useNavigate();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [checked, setChecked] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch tickets with filters
  const {
    tickets: allTickets,
    loading,
    error,
    pagination,
    setPage,
    setSearch,
    setStatus,
    setPriority,
    setSorting,
    refresh,
  } = useTickets({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    status: statusFilter,
    priority: priorityFilter,
    sortBy,
    sortOrder,
  });

  // Filter for unread tickets on frontend
  const tickets = unreadOnly 
    ? allTickets.filter(t => t.unread_count > 0)
    : allTickets;

  // Update page when pagination changes
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage, setPage]);

  // Apply search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setSearch]);

  // Apply filters
  useEffect(() => {
    setStatus(statusFilter);
    setCurrentPage(1);
  }, [statusFilter, setStatus]);

  useEffect(() => {
    setPriority(priorityFilter);
    setCurrentPage(1);
  }, [priorityFilter, setPriority]);

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
      setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC");
    } else {
      setSortBy(key);
      setSortOrder("DESC");
    }
    setSorting(key, sortOrder === "DESC" ? "ASC" : "DESC");
  };

  // Navigate to ticket details
  const viewTicket = (ticketNumber) => {
    navigate(`/tickets/details?id=${encodeURIComponent(ticketNumber)}`);
  };

  // Clear selection
  const clearSelection = () => setChecked({});

  return (
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`hidden md:block sticky top-0 self-start h-[calc(100vh-0px)] w-64 pr-6 mr-6 ${borderClass}`}
          style={{ borderRightWidth: 1 }}
        >
          <div className="rounded-lg overflow-hidden h-full">
            <div className="px-4 py-3 text-sm font-semibold text-gray-300">
              Tickets
            </div>

            <nav className="px-4 pb-4 space-y-2">
              <button
                onClick={() => {
                  setStatusFilter("");
                  setUnreadOnly(false);
                  clearSelection();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  !statusFilter && !unreadOnly
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                All Tickets
              </button>

              <button
                onClick={() => {
                  setStatusFilter("");
                  setUnreadOnly(true);
                  clearSelection();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                  unreadOnly
                    ? "bg-red-900/30 text-red-100 border border-red-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>Unread Tickets</span>
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  !
                </span>
              </button>

              <button
                onClick={() => {
                  setStatusFilter("open");
                  setUnreadOnly(false);
                  clearSelection();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "open" && !unreadOnly
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                Open Tickets
              </button>

              <button
                onClick={() => {
                  setStatusFilter("pending");
                  setUnreadOnly(false);
                  clearSelection();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "pending" && !unreadOnly
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                Pending Tickets
              </button>

              <button
                onClick={() => {
                  setStatusFilter("resolved");
                  setUnreadOnly(false);
                  clearSelection();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  statusFilter === "resolved" && !unreadOnly
                    ? "bg-blue-900/30 text-blue-100 border border-blue-800"
                    : "text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                Resolved Tickets
              </button>
            </nav>
          </div>
        </aside>

        {/* Main column */}
        <section className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">
                {statusFilter === ""
                  ? "All Tickets"
                  : statusFilter === "open"
                  ? "Open Tickets"
                  : statusFilter === "pending"
                  ? "Pending Tickets"
                  : statusFilter === "resolved"
                  ? "Resolved Tickets"
                  : "Tickets"}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                {loading
                  ? "Loading..."
                  : `${pagination.total || 0} total tickets`}
              </p>
            </div>
            <button
              onClick={refresh}
              className={`${BTN} flex items-center gap-2`}
              disabled={loading}
            >
              <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-lg">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 h-10 rounded-md bg-[#1d2328] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Search tickets, order ID, customer email..."
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`${BTN} cursor-pointer`}
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Selection actions */}
            {hasSelection && (
              <button
                className={`${BTN} flex items-center gap-2`}
                onClick={clearSelection}
              >
                <Trash2 size={14} />
                Clear Selection ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && tickets.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
              <p className="text-gray-400">Loading tickets...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mt-8 flex flex-col items-center justify-center py-12">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-gray-400 mb-4">{error}</p>
              <button onClick={refresh} className={BTN}>
                Try Again
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="mt-3 rounded-lg overflow-hidden border border-[#293239]">
              {/* head */}
              <div className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 border-b border-[#293239] bg-[#1a1f24]">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-2 flex items-center gap-3">
                    <input
                      ref={headCheckboxRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#293239] bg-transparent"
                      aria-label="Select all on page"
                      onChange={(e) => toggleAllOnPage(e.target.checked)}
                      checked={allOnPageChecked}
                    />
                    <span>Ticket #</span>
                  </div>
                  <div className="col-span-3 md:col-span-2">Order ID</div>
                  <div className="col-span-5 md:col-span-4">Subject</div>
                  <div className="hidden md:block md:col-span-2">Customer</div>
                  <div className="hidden md:block md:col-span-1">Priority</div>
                  <div className="hidden md:block md:col-span-1 text-right">
                    Updated
                  </div>
                </div>
              </div>

              {/* body */}
              <ul className={`divide-y ${borderClass}`}>
                {tickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${borderClass} ${
                      ticket.unread_count > 0 
                        ? 'bg-red-500/10 hover:bg-red-500/15 border-l-4 border-l-red-500' 
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => viewTicket(ticket.ticket_number)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* checkbox + id + status */}
                      <div className="col-span-4 md:col-span-2 flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#293239] bg-transparent"
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
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-blue-400 font-medium">
                            {ticket.ticket_number}
                          </span>
                          {ticket.unread_count > 0 && (
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                              {ticket.unread_count}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* shopify order id */}
                      <div className="col-span-3 md:col-span-2 min-w-0">
                        <span className="truncate text-sm text-gray-300">
                          {ticket.shopify_order_name ||
                            ticket.shopify_order_id ||
                            "-"}
                        </span>
                      </div>

                      {/* subject */}
                      <div className="col-span-5 md:col-span-4 min-w-0">
                        <span className="truncate text-sm text-gray-200">
                          {ticket.subject}
                        </span>
                      </div>

                      {/* customer */}
                      <div className="hidden md:block md:col-span-2 min-w-0">
                        <span className="truncate text-xs text-gray-400">
                          {ticket.customer_email}
                        </span>
                      </div>

                      {/* priority */}
                      <div className="hidden md:block md:col-span-1">
                        <PriorityBadge priority={ticket.priority} />
                      </div>

                      {/* updated */}
                      <div className="hidden md:block md:col-span-1 text-right">
                        <span className="text-xs text-gray-400">
                          {new Date(ticket.updated_at).toLocaleString([], {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}

                {tickets.length === 0 && !loading && (
                  <li className="px-4 py-10 text-center text-sm text-gray-400">
                    No tickets found
                  </li>
                )}
              </ul>

              {/* footer / pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-[#293239] bg-[#1a1f24]">
                <p className="text-xs text-gray-400">
                  Showing {tickets.length} of {pagination.total || 0} tickets
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className={`${BTN} ${
                      currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {currentPage} / {pagination.totalPages || 1}
                  </span>
                  <button
                    className={`${BTN} ${
                      currentPage === pagination.totalPages
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages || 1, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
