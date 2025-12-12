// src/pages/CustomerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCustomer } from "../hooks/useCustomer";

const COLORS = {
  page: "#151a1e",
  card: "#1d2328",
  border: "#293239",
};

const CARD = `bg-[${COLORS.card}] border border-[${COLORS.border}] rounded-lg`;
const BTN = `px-3 py-2 text-sm rounded-md bg-[#1a2126] border border-[#293239] text-gray-300 hover:bg-white/5`;
const INPUT = `w-full px-3 py-2 rounded-md bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40`;

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customer, loading, error, updateCustomer, refresh } =
    useCustomer(customerId);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (customer) {
      setEditData({
        name: customer.name || "",
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      // Only send fields that backend supports
      const updateData = {
        name: editData.name,
        phone: editData.phone,
      };
      await updateCustomer(updateData);
      setIsEditing(false);
    } catch (err) {
      setSaveError(
        err.message || "Failed to update customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-full bg-[#151a1e] text-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-400">Loading customer details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-full bg-[#151a1e] text-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">⚠️ Error loading customer</div>
            <p className="text-gray-400 mb-4">{error}</p>
            <div className="space-x-3">
              <button onClick={refresh} className={BTN}>
                Try Again
              </button>
              <button onClick={() => navigate("/customers")} className={BTN}>
                Back to Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full min-h-full bg-[#151a1e] text-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">Customer not found</div>
            <button onClick={() => navigate("/customers")} className={BTN}>
              Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/customers")}
              className="p-2 rounded-md hover:bg-white/5 text-gray-400"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold">Customer Details</h1>
              <p className="text-sm text-gray-400">
                View and edit customer information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`${BTN} bg-blue-900/20 border-blue-800 text-blue-200 hover:bg-blue-900/30`}
              >
                Edit Customer
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                  className={BTN}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`${BTN} bg-green-900/20 border-green-800 text-green-200 hover:bg-green-900/30 disabled:opacity-50`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-800 text-red-200 text-sm">
            ⚠️ {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className={CARD}>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={INPUT}
                        placeholder="Enter customer name"
                      />
                    ) : (
                      <p className="text-gray-200 py-2">
                        {customer.name || (
                          <span className="text-gray-500 italic">
                            No name provided
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="text-gray-200 py-2 break-words overflow-wrap-anywhere">
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Email cannot be edited
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={INPUT}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-gray-200 py-2">
                        {customer.phone || (
                          <span className="text-gray-500 italic">
                            No phone provided
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer ID
                    </label>
                    <p className="text-gray-400 py-2 font-mono text-sm">
                      {customer.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className={CARD}>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Quick Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Conversations</span>
                    <span className="font-medium">
                      {customer.totalConversations || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.status === "active"
                          ? "bg-green-900/30 text-green-300 border border-green-800"
                          : customer.status === "blocked"
                          ? "bg-red-900/30 text-red-300 border border-red-800"
                          : customer.status === "inactive"
                          ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
                          : "bg-gray-900/30 text-gray-300 border border-gray-700"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Contact</span>
                    <span className="text-sm">{customer.lastActivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-sm">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={CARD}>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    to={`/chats?customer=${customer.id}`}
                    className={`${BTN} w-full text-center block bg-blue-900/20 border-blue-800 text-blue-200 hover:bg-blue-900/30`}
                  >
                    View Conversations ({customer.totalConversations || 0})
                  </Link>
                  <Link
                    to={`/tickets?customer=${customer.id}`}
                    className={`${BTN} w-full text-center block`}
                  >
                    View Tickets
                  </Link>
                  <button
                    className={`${BTN} w-full text-red-300 border-red-800 hover:bg-red-900/20`}
                    title="Block this customer from accessing services"
                  >
                    Block Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
