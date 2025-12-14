// src/pages/CustomerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate("/customers")}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.95 }}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                Customer Details
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                View and manage customer information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all shadow-lg shadow-blue-500/10 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Customer
              </motion.button>
            ) : (
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-500/20 border border-gray-500/30 text-gray-300 hover:bg-gray-500/30 transition-all font-semibold"
                  disabled={saving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 transition-all shadow-lg shadow-green-500/10 font-semibold disabled:opacity-50"
                  whileHover={{ scale: saving ? 1 : 1.05 }}
                  whileTap={{ scale: saving ? 1 : 0.95 }}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <motion.svg 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </motion.svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Error message */}
        {saveError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-200 text-sm shadow-lg shadow-red-500/10"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {saveError}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-lg shadow-xl shadow-blue-500/5"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <motion.input
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-blue-500/5 font-medium"
                        placeholder="Enter customer name"
                      />
                    ) : (
                      <p className="text-gray-200 py-3 font-medium">
                        {customer.name || (
                          <span className="text-gray-500 italic">
                            No name provided
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Email
                    </label>
                    <p className="text-gray-200 py-3 break-words font-medium">
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be edited
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Phone
                    </label>
                    {isEditing ? (
                      <motion.input
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        whileFocus={{ scale: 1.01 }}
                        type="tel"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-blue-500/5 font-medium"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-gray-200 py-3 font-medium">
                        {customer.phone || (
                          <span className="text-gray-500 italic">
                            No phone provided
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Customer ID
                    </label>
                    <p className="text-gray-400 py-3 font-mono text-sm bg-gray-500/10 px-3 rounded-lg border border-gray-500/20">
                      #{customer.id}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 rounded-lg shadow-xl shadow-blue-500/5"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                  Quick Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Total Conversations</span>
                    <motion.span 
                      className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                      whileHover={{ scale: 1.1 }}
                    >
                      {customer.totalConversations || 0}
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Status</span>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-lg ${
                        customer.status === "active"
                          ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/50 shadow-green-500/20"
                          : customer.status === "blocked"
                          ? "bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 border border-red-500/50 shadow-red-500/20"
                          : customer.status === "inactive"
                          ? "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20"
                          : "bg-gradient-to-r from-gray-500/30 to-slate-500/30 text-gray-300 border border-gray-500/50"
                      }`}
                    >
                      {customer.status}
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Last Contact</span>
                    <span className="text-sm font-semibold text-gray-300">{customer.lastActivity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Member Since</span>
                    <span className="text-sm font-semibold text-gray-300">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-lg shadow-xl shadow-blue-500/5"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    to={`/chats?customer=${customer.id}`}
                  >
                    <motion.div
                      className="w-full text-center px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all shadow-lg shadow-blue-500/10 font-semibold"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Conversations ({customer.totalConversations || 0})
                    </motion.div>
                  </Link>
                  <Link
                    to={`/tickets?customer=${customer.id}`}
                  >
                    <motion.div
                      className="w-full text-center px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-blue-600/30 transition-all shadow-lg shadow-blue-500/10 font-semibold"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Tickets
                    </motion.div>
                  </Link>
                  <motion.button
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 hover:from-red-500/30 hover:to-orange-500/30 transition-all shadow-lg shadow-red-500/10 font-semibold"
                    title="Block this customer from accessing services"
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Block Customer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
