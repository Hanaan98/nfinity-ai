import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useUser } from "../hooks/useUser";
import LoadingSpinner from "../components/LoadingSpinner";

// Sessions management component
function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        // Mock sessions data since the API endpoint might not exist yet
        const mockSessions = [
          {
            id: "current",
            device: "Chrome on Windows",
            location: "New York, US",
            lastActive: new Date().toISOString(),
            current: true,
            ip: "192.168.1.100",
          },
          {
            id: "session-2",
            device: "Firefox on Mac",
            location: "San Francisco, US",
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            current: false,
            ip: "192.168.1.101",
          },
          {
            id: "session-3",
            device: "Safari on iPhone",
            location: "Los Angeles, US",
            lastActive: new Date(
              Date.now() - 24 * 60 * 60 * 1000
            ).toISOString(),
            current: false,
            ip: "10.0.0.1",
          },
        ];
        setSessions(mockSessions);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleTerminateSession = async (sessionId) => {
    try {
      setTerminating(sessionId);
      // await chatApi.terminateSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to terminate session:", err);
    } finally {
      setTerminating(null);
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      setTerminating("all");
      // await chatApi.terminateAllSessions();
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (err) {
      console.error("Failed to terminate all sessions:", err);
    } finally {
      setTerminating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Active Sessions</h2>
        <button
          onClick={handleTerminateAllSessions}
          disabled={terminating === "all"}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm flex items-center gap-2"
        >
          {terminating === "all" && <LoadingSpinner size="sm" />}
          End All Other Sessions
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-[#151a1e] border border-[#293239] rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">
                {session.device.includes("iPhone") ||
                session.device.includes("Android")
                  ? "📱"
                  : "🖥️"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-200">
                    {session.device}
                  </h3>
                  {session.current && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{session.location}</p>
                <p className="text-xs text-gray-500">
                  Last active: {new Date(session.lastActive).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">IP: {session.ip}</p>
              </div>
            </div>
            {!session.current && (
              <button
                onClick={() => handleTerminateSession(session.id)}
                disabled={terminating === session.id}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                {terminating === session.id && <LoadingSpinner size="sm" />}
                End Session
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
        <h3 className="font-medium text-yellow-200 mb-2">Security Notice</h3>
        <p className="text-sm text-yellow-100">
          If you see any sessions you don't recognize, end them immediately and
          consider changing your password.
        </p>
      </div>
    </div>
  );
}

// Advanced settings component
function AdvancedTab() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      // await chatApi.exportUserData();
      // Mock the export process
      setTimeout(() => {
        const data = {
          profile: { name: "User Data", email: "user@example.com" },
          preferences: {},
          activityLog: [],
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user-data-export.json";
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to export data:", err);
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      // await chatApi.deleteAccount(deletePassword);
      console.log("Account deletion would happen here");
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeletePassword("");
    } catch (err) {
      console.error("Failed to delete account:", err);
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100 mb-6">
        Advanced Settings
      </h2>

      <div className="space-y-8">
        {/* Data Export */}
        <div className="bg-[#151a1e] border border-[#293239] rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4">
            Data Export
          </h3>
          <p className="text-gray-400 mb-4">
            Download a copy of all your data including profile information,
            preferences, and activity logs.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {exporting && <LoadingSpinner size="sm" />}
            {exporting ? "Preparing Export..." : "Download My Data"}
          </button>
        </div>

        {/* API Access */}
        <div className="bg-[#151a1e] border border-[#293239] rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4">API Access</h3>
          <p className="text-gray-400 mb-4">
            Generate API tokens for third-party integrations and automated
            access.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Generate Token
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              View Tokens
            </button>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-[#151a1e] border border-[#293239] rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4">
            Security Audit Log
          </h3>
          <p className="text-gray-400 mb-4">
            View recent security-related activities on your account.
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[
              {
                action: "Password changed",
                date: "2024-10-26 14:30",
                ip: "192.168.1.100",
              },
              {
                action: "Login from new device",
                date: "2024-10-25 09:15",
                ip: "10.0.0.1",
              },
              {
                action: "Profile updated",
                date: "2024-10-24 16:45",
                ip: "192.168.1.100",
              },
              {
                action: "Two-factor authentication enabled",
                date: "2024-10-23 11:20",
                ip: "192.168.1.100",
              },
            ].map((log, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm p-2 bg-[#1d2328] rounded"
              >
                <span className="text-gray-300">{log.action}</span>
                <div className="text-gray-500">
                  <span>{log.date}</span>
                  <span className="ml-2">({log.ip})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-200 mb-4">Danger Zone</h3>

          {!showDeleteConfirm ? (
            <div>
              <p className="text-red-100 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete My Account
              </button>
            </div>
          ) : (
            <div>
              <p className="text-red-100 mb-4">
                <strong>Are you absolutely sure?</strong> This will permanently
                delete your account and all data.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-red-200 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full max-w-sm px-3 py-2 bg-[#151a1e] border border-red-500 rounded-md text-gray-200"
                    placeholder="Your password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting && <LoadingSpinner size="sm" />}
                    {deleting ? "Deleting..." : "Yes, Delete My Account"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    timezone: "",
    language: "en",
    preferences: {
      dateFormat: "MM/dd/yyyy",
      timeFormat: "12h",
    },
    notifications: {
      email: true,
      push: true,
      desktop: true,
      newChats: true,
      mentions: true,
      system: true,
    },
    privacy: {
      profileVisibility: "team",
      showOnlineStatus: true,
      allowDirectMessages: true,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: "30",
      requirePasswordChange: false,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const { user } = useAuth();
  const { updateProfile, changePassword, getProfile, loading, error } =
    useUser();

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getProfile();

        // Populate form with user data
        setFormData((prev) => ({
          ...prev,
          firstName: profile.user?.firstName || user?.firstName || "",
          lastName: profile.user?.lastName || user?.lastName || "",
          email: profile.user?.email || user?.email || "",
          phone: profile.user?.phone || "",
          department: profile.user?.department || "",
          jobTitle: profile.user?.jobTitle || "",
          timezone:
            profile.user?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: profile.user?.language || "en",
          notifications: {
            ...prev.notifications,
            ...(profile.user?.preferences?.notifications || {}),
          },
          privacy: {
            ...prev.privacy,
            ...(profile.user?.preferences?.privacy || {}),
          },
          security: {
            ...prev.security,
            ...(profile.user?.preferences?.security || {}),
          },
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, getProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSaving(true);
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        jobTitle: formData.jobTitle,
        timezone: formData.timezone,
        language: formData.language,
        preferences: {
          notifications: formData.notifications,
          privacy: formData.privacy,
          security: formData.security,
        },
      });

      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setIsSaving(true);
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSaveMessage("Password changed successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Failed to change password:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "👁️" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "sessions", label: "Active Sessions", icon: "🖥️" },
    { id: "advanced", label: "Advanced", icon: "⚡" },
  ];

  if (isLoading) {
    return (
      <div className="w-full min-h-full bg-[#151a1e] text-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-100">Settings</h1>
          {saveMessage && (
            <div className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">
              {saveMessage}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-600/20 border border-red-600/30 rounded-md text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-[#1d2328] border border-[#293239] rounded-lg p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-[#293239]"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-[#1d2328] border border-[#293239] rounded-lg p-6">
              {activeTab === "profile" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">
                    Profile Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-[#293239]"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                          errors.lastName
                            ? "border-red-500"
                            : "border-[#293239]"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                          errors.email ? "border-red-500" : "border-[#293239]"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                          errors.phone ? "border-red-500" : "border-[#293239]"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Department
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                      >
                        <option value="">Select Department</option>
                        <option value="sales">Sales</option>
                        <option value="support">Customer Support</option>
                        <option value="marketing">Marketing</option>
                        <option value="engineering">Engineering</option>
                        <option value="product">Product</option>
                        <option value="hr">Human Resources</option>
                        <option value="finance">Finance</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                        placeholder="e.g., Senior Support Agent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving && <LoadingSpinner size="sm" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-6">
                      Security Settings
                    </h2>

                    {/* Change Password Form */}
                    <form
                      onSubmit={handleChangePassword}
                      className="space-y-4 mb-8"
                    >
                      <h3 className="text-lg font-medium text-gray-200">
                        Change Password
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                            errors.currentPassword
                              ? "border-red-500"
                              : "border-[#293239]"
                          }`}
                        />
                        {errors.currentPassword && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                              errors.newPassword
                                ? "border-red-500"
                                : "border-[#293239]"
                            }`}
                          />
                          {errors.newPassword && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.newPassword}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 bg-[#151a1e] border rounded-md text-gray-200 ${
                              errors.confirmPassword
                                ? "border-red-500"
                                : "border-[#293239]"
                            }`}
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSaving || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving && <LoadingSpinner size="sm" />}
                        Change Password
                      </button>
                    </form>

                    {/* Security Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-200">
                        Security Options
                      </h3>

                      <div className="flex items-center justify-between py-3 border-b border-[#293239]">
                        <div>
                          <p className="text-gray-200">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          name="security.twoFactorEnabled"
                          checked={formData.security.twoFactorEnabled}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 bg-[#151a1e] border-[#293239] rounded"
                        />
                      </div>

                      <div className="py-3 border-b border-[#293239]">
                        <label className="block text-gray-200 mb-2">
                          Session Timeout
                        </label>
                        <select
                          name="security.sessionTimeout"
                          value={formData.security.sessionTimeout}
                          onChange={handleInputChange}
                          className="px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                          <option value="480">8 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-4">
                        Delivery Methods
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "email",
                            label: "Email Notifications",
                            desc: "Receive notifications via email",
                          },
                          {
                            key: "push",
                            label: "Push Notifications",
                            desc: "Browser push notifications",
                          },
                          {
                            key: "desktop",
                            label: "Desktop Notifications",
                            desc: "System desktop notifications",
                          },
                        ].map(({ key, label, desc }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-3 border-b border-[#293239]"
                          >
                            <div>
                              <p className="text-gray-200">{label}</p>
                              <p className="text-sm text-gray-400">{desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              name={`notifications.${key}`}
                              checked={formData.notifications[key]}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 bg-[#151a1e] border-[#293239] rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-4">
                        Notification Types
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "newChats",
                            label: "New Chat Messages",
                            desc: "When you receive new chat messages",
                          },
                          {
                            key: "mentions",
                            label: "Mentions & Direct Messages",
                            desc: "When someone mentions you or sends a DM",
                          },
                          {
                            key: "system",
                            label: "System Updates",
                            desc: "Important system announcements and updates",
                          },
                        ].map(({ key, label, desc }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-3 border-b border-[#293239]"
                          >
                            <div>
                              <p className="text-gray-200">{label}</p>
                              <p className="text-sm text-gray-400">{desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              name={`notifications.${key}`}
                              checked={formData.notifications[key]}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 bg-[#151a1e] border-[#293239] rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving && <LoadingSpinner size="sm" />}
                        Save Notification Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="py-3 border-b border-[#293239]">
                      <label className="block text-gray-200 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        name="privacy.profileVisibility"
                        value={formData.privacy.profileVisibility}
                        onChange={handleInputChange}
                        className="px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                      >
                        <option value="public">
                          Public - Visible to all users
                        </option>
                        <option value="team">
                          Team Only - Visible to team members
                        </option>
                        <option value="private">
                          Private - Only visible to you
                        </option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-[#293239]">
                      <div>
                        <p className="text-gray-200">Show Online Status</p>
                        <p className="text-sm text-gray-400">
                          Let others see when you're online
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        name="privacy.showOnlineStatus"
                        checked={formData.privacy.showOnlineStatus}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-[#151a1e] border-[#293239] rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-[#293239]">
                      <div>
                        <p className="text-gray-200">Allow Direct Messages</p>
                        <p className="text-sm text-gray-400">
                          Allow team members to send you direct messages
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        name="privacy.allowDirectMessages"
                        checked={formData.privacy.allowDirectMessages}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-[#151a1e] border-[#293239] rounded"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving && <LoadingSpinner size="sm" />}
                        Save Privacy Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">
                    Application Preferences
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Timezone
                        </label>
                        <select
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                        >
                          <option value="America/New_York">
                            Eastern Time (ET)
                          </option>
                          <option value="America/Chicago">
                            Central Time (CT)
                          </option>
                          <option value="America/Denver">
                            Mountain Time (MT)
                          </option>
                          <option value="America/Los_Angeles">
                            Pacific Time (PT)
                          </option>
                          <option value="Europe/London">GMT (London)</option>
                          <option value="Europe/Paris">CET (Paris)</option>
                          <option value="Asia/Tokyo">JST (Tokyo)</option>
                          <option value="Asia/Shanghai">CST (Shanghai)</option>
                          <option value="Australia/Sydney">
                            AEST (Sydney)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Language
                        </label>
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="it">Italiano</option>
                          <option value="pt">Português</option>
                          <option value="zh">中文</option>
                          <option value="ja">日本語</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-200">
                        Interface Settings
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Date Format
                          </label>
                          <select
                            name="preferences.dateFormat"
                            value={
                              formData.preferences?.dateFormat || "MM/dd/yyyy"
                            }
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                          >
                            <option value="MM/dd/yyyy">MM/dd/yyyy (US)</option>
                            <option value="dd/MM/yyyy">dd/MM/yyyy (EU)</option>
                            <option value="yyyy-MM-dd">yyyy-MM-dd (ISO)</option>
                            <option value="dd-MMM-yyyy">dd-MMM-yyyy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Time Format
                          </label>
                          <select
                            name="preferences.timeFormat"
                            value={formData.preferences?.timeFormat || "12h"}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-[#151a1e] border border-[#293239] rounded-md text-gray-200"
                          >
                            <option value="12h">12-hour (AM/PM)</option>
                            <option value="24h">24-hour</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving && <LoadingSpinner size="sm" />}
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sessions" && <SessionsTab />}

              {activeTab === "advanced" && <AdvancedTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
