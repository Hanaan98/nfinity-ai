// src/pages/Users.jsx
import React, { useState, useMemo } from "react";
import {
  Spinner,
  ErrorState,
  EmptyState,
  Skeleton,
} from "../components/LoadingStates";

const PAGE_BG = "bg-[#151a1e]";
const CARD_BG = "bg-[#1d2328]";
const BORDER = "border border-[#293239]";
const BTN =
  "px-3 py-2 text-sm rounded-md bg-[#1a2126] border border-[#293239] text-gray-300 hover:bg-white/5 transition-colors";

// Demo data - replace with actual API calls
const DEMO_USERS = [
  {
    id: "user-1",
    email: "grace@company.com",
    name: "Grace Chalk",
    role: "admin",
    status: "active",
    invitedBy: "System",
    invitedAt: "2024-01-15T10:00:00Z",
    lastLogin: "2025-10-26T09:30:00Z",
    avatar: null,
  },
  {
    id: "user-2",
    email: "syedhanaan1@gmail.com",
    name: "Syed Hanaan",
    role: "admin",
    status: "active",
    invitedBy: "Grace Chalk",
    invitedAt: "2024-02-10T14:20:00Z",
    lastLogin: "2025-10-26T08:15:00Z",
    avatar: null,
  },
  {
    id: "user-3",
    email: "john.doe@company.com",
    name: "John Doe",
    role: "user",
    status: "pending",
    invitedBy: "Grace Chalk",
    invitedAt: "2025-10-25T16:45:00Z",
    lastLogin: null,
    avatar: null,
  },
  {
    id: "user-4",
    email: "sarah.wilson@company.com",
    name: "Sarah Wilson",
    role: "user",
    status: "active",
    invitedBy: "Grace Chalk",
    invitedAt: "2025-10-20T11:30:00Z",
    lastLogin: "2025-10-25T17:20:00Z",
    avatar: null,
  },
];

function UserRow({ user, onResendInvite, onDeactivate, onActivate, onDelete }) {
  const [actionLoading, setActionLoading] = useState("");

  const handleAction = async (actionType, actionFn) => {
    setActionLoading(actionType);
    try {
      await actionFn(user.id);
    } catch (err) {
      console.error(`Failed to ${actionType}:`, err);
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role) => {
    return role === "admin"
      ? "bg-purple-900/30 text-purple-300 border-purple-800"
      : "bg-blue-900/30 text-blue-300 border-blue-800";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-900/30 text-green-300 border-green-800";
      case "pending":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-800";
      case "inactive":
        return "bg-gray-900/30 text-gray-300 border-gray-700";
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-700";
    }
  };

  return (
    <tr className="hover:bg-white/2 border-b border-[#293239]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-200">{user.name}</div>
            <div className="text-sm text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRoleColor(
            user.role
          )}`}
        >
          {user.role}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(
            user.status
          )}`}
        >
          {user.status}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-gray-400">
        <div>{user.invitedBy}</div>
        <div className="text-xs text-gray-500">
          {formatDate(user.invitedAt)}
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-400">
        {formatDate(user.lastLogin)}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {user.status === "pending" && (
            <button
              onClick={() => handleAction("resend", onResendInvite)}
              disabled={actionLoading === "resend"}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {actionLoading === "resend" && <Spinner size="sm" />}
              Resend
            </button>
          )}

          {user.status === "active" && user.role !== "admin" && (
            <button
              onClick={() => handleAction("deactivate", onDeactivate)}
              disabled={actionLoading === "deactivate"}
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {actionLoading === "deactivate" && <Spinner size="sm" />}
              Deactivate
            </button>
          )}

          {user.status === "inactive" && (
            <button
              onClick={() => handleAction("activate", onActivate)}
              disabled={actionLoading === "activate"}
              className="text-green-400 hover:text-green-300 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {actionLoading === "activate" && <Spinner size="sm" />}
              Activate
            </button>
          )}

          {user.role !== "admin" && (
            <button
              onClick={() => handleAction("delete", onDelete)}
              disabled={actionLoading === "delete"}
              className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {actionLoading === "delete" && <Spinner size="sm" />}
              Remove
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function InviteUserModal({ isOpen, onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onInvite({ email, name, role });
      setEmail("");
      setName("");
      setRole("user");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-xl`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-100">
              Invite new user
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 h-10 rounded-md bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="invite-name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full name
              </label>
              <input
                id="invite-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 h-10 rounded-md bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="invite-role"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 h-10 rounded-md bg-[#151a1e] border border-[#293239] text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-[#1a2126] border border-[#293239] rounded-md hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email || !name}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Spinner size="sm" />}
                {loading ? "Sending..." : "Send invitation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleInviteUser = async (userData) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      status: "pending",
      invitedBy: "Current User", // Replace with actual current user
      invitedAt: new Date().toISOString(),
      lastLogin: null,
      avatar: null,
    };

    setUsers((prev) => [...prev, newUser]);
  };

  const handleResendInvite = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Resending invite for user:", userId);
  };

  const handleDeactivateUser = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "inactive" } : user
      )
    );
  };

  const handleActivateUser = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "active" } : user
      )
    );
  };

  const handleDeleteUser = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  if (error) {
    return (
      <div className={`w-full min-h-full ${PAGE_BG} text-gray-100 p-6`}>
        <ErrorState
          title="Unable to Load Users"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-full ${PAGE_BG} text-gray-100 p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage team members and their access permissions
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Invite user
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 h-10 rounded-lg bg-[#1d2328] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 h-10 rounded-lg bg-[#1d2328] border border-[#293239] text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`${CARD_BG} ${BORDER} rounded-lg p-4`}>
          <div className="text-2xl font-bold text-gray-100">{users.length}</div>
          <div className="text-sm text-gray-400">Total users</div>
        </div>
        <div className={`${CARD_BG} ${BORDER} rounded-lg p-4`}>
          <div className="text-2xl font-bold text-green-400">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className={`${CARD_BG} ${BORDER} rounded-lg p-4`}>
          <div className="text-2xl font-bold text-yellow-400">
            {users.filter((u) => u.status === "pending").length}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className={`${CARD_BG} ${BORDER} rounded-lg p-4`}>
          <div className="text-2xl font-bold text-purple-400">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="text-sm text-gray-400">Admins</div>
        </div>
      </div>

      {/* Users table */}
      <div className={`${CARD_BG} ${BORDER} rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a2126] border-b border-[#293239]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Invited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293239]">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-[#293239]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onResendInvite={handleResendInvite}
                    onDeactivate={handleDeactivateUser}
                    onActivate={handleActivateUser}
                    onDelete={handleDeleteUser}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <EmptyState
                      title="No users found"
                      message="No users match your current search criteria."
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
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteUser}
      />
    </div>
  );
}
