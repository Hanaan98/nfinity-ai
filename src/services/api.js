// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;

    // Enhanced error handling for better UX
    this.userMessage = this.getUserFriendlyMessage(message, status);
  }

  getUserFriendlyMessage(message, status) {
    // Don't expose technical details to users
    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Invalid email or password.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "The provided data is invalid. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Our servers are temporarily unavailable. Please try again later.";
      default:
        // For network errors or unknown status
        if (status === 0) {
          return "Unable to connect. Please check your internet connection.";
        }
        // Return original message but sanitized
        return message || "An unexpected error occurred. Please try again.";
    }
  }
}

// Token management
let accessToken = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");

export const setTokens = (tokens) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
};

export const getAccessToken = () => accessToken;

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Only add Content-Type for non-FormData requests
  // FormData needs the browser to set Content-Type with boundary
  if (!(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  // Add authorization header if token exists and not a public endpoint
  if (accessToken && !options.skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log(`Making API request to: ${url}`, config);

  try {
    const response = await fetch(url, config);
    console.log(`API response status: ${response.status}`, response);

    // Handle 401 Unauthorized - try to refresh token
    if (
      response.status === 401 &&
      refreshToken &&
      !options.skipAuth &&
      !endpoint.includes("/auth/refresh")
    ) {
      console.log("401 detected, attempting token refresh...");
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          setTokens(tokens);

          // Retry original request with new token
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          const retryResponse = await fetch(url, config);

          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = "/login";
        return;
      }
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log("API error data:", errorData);
      } catch {
        errorData = {
          message: response.statusText || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      // Extract the most relevant error message
      let errorMessage =
        errorData.message || errorData.error || errorData.detail;

      // Handle common API error formats
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors[0]?.message || errorData.errors[0];
      } else if (errorData.details && typeof errorData.details === "string") {
        errorMessage = errorData.details;
      }

      console.error("API Error:", errorMessage, response.status, errorData);
      throw new ApiError(
        errorMessage || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const responseData = await response.json();
    console.log("API success response:", responseData);
    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Network error:", error);
    // Enhanced network error handling
    let networkErrorMessage =
      "Network error. Please check your connection and try again.";
    let errorStatus = 0;

    // Provide more specific network error messages
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      networkErrorMessage =
        "Unable to connect to the server. Please check your internet connection.";
    } else if (error.name === "AbortError") {
      networkErrorMessage = "Request was cancelled. Please try again.";
    } else if (error.message.includes("timeout")) {
      networkErrorMessage = "Request timed out. Please try again.";
    }

    throw new ApiError(networkErrorMessage, errorStatus, {
      originalError: error.message,
      type: "network",
    });
  }
}

export const chatApi = {
  // Get all chats with optional filtering
  async getChats({ page = 1, limit = 20, filter = "all", search = "" } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filter && filter !== "all") {
      params.append("filter", filter);
    }

    if (search.trim()) {
      params.append("search", search.trim());
    }

    const endpoint = `/chat/all?${params.toString()}`;
    return await apiRequest(endpoint);
  },

  // Mark chat as read
  async markChatAsRead(sessionId) {
    return await apiRequest(`/chat/${sessionId}/read`, {
      method: "PUT",
    });
  },

  // Update customer info for a chat
  async updateCustomerInfo(sessionId, customerData) {
    return await apiRequest(`/chat/${sessionId}/customer`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  },

  // Get complete message history for a specific chat
  async getChatMessages(sessionId) {
    return await apiRequest(`/chat/${sessionId}`);
  },

  // Update chat status
  async updateChatStatus(sessionId, status) {
    return await apiRequest(`/chat/${sessionId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Get all customers with optional filtering
  async getCustomers({
    page = 1,
    limit = 20,
    search = "",
    status = "all",
  } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== "all") {
      params.append("status", status);
    }

    if (search.trim()) {
      params.append("search", search.trim());
    }

    const endpoint = `/customers?${params.toString()}`;
    return await apiRequest(endpoint);
  },

  // Get customer details
  async getCustomer(customerId) {
    return await apiRequest(`/customers/${customerId}`);
  },

  // Update customer information
  async updateCustomer(customerId, customerData) {
    return await apiRequest(`/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  },

  // Get chats for a specific customer
  async getCustomerChats(customerId, { page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const endpoint = `/chat/customer-id/${customerId}/chats?${params.toString()}`;
    console.log("Making API call to:", endpoint);
    return await apiRequest(endpoint);
  },

  // Get orders by tag with optional filtering
  async getOrdersByTag(
    tag,
    {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "date",
      sortOrder = "desc",
    } = {}
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) {
      params.append("search", search.trim());
    }

    if (sortBy) {
      params.append("sortBy", sortBy);
    }

    if (sortOrder) {
      params.append("sortOrder", sortOrder);
    }

    const endpoint = `/orders/tag/${tag}?${params.toString()}`;
    return await apiRequest(endpoint);
  },

  // Get all orders with optional filtering
  async getOrders({
    page = 1,
    limit = 20,
    search = "",
    status = "all",
    sortBy = "date",
    sortOrder = "desc",
  } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) {
      params.append("search", search.trim());
    }

    if (status && status !== "all") {
      params.append("status", status);
    }

    if (sortBy) {
      params.append("sortBy", sortBy);
    }

    if (sortOrder) {
      params.append("sortOrder", sortOrder);
    }

    const endpoint = `/orders?${params.toString()}`;
    return await apiRequest(endpoint);
  },

  // Get local orders from database
  async getLocalOrders({
    page = 1,
    limit = 20,
    search = "",
    sortKey = "created_at",
    sortOrder = "desc",
  } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) {
      params.append("search", search.trim());
    }

    if (sortKey) {
      params.append("sortKey", sortKey);
    }

    if (sortOrder) {
      params.append("sortOrder", sortOrder);
    }

    const endpoint = `/local-orders?${params.toString()}`;
    return await apiRequest(endpoint);
  },

  // Get order details
  async getOrder(orderId) {
    return await apiRequest(`/orders/${orderId}`);
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    return await apiRequest(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Authentication endpoints
  async signIn(credentials) {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true,
    });

    console.log("Raw API response:", response);

    // Handle the nested response structure from the API
    let user, accessToken, refreshToken;

    if (response.success && response.data) {
      // New API response format
      user = response.data.user;
      accessToken = response.data.tokens?.accessToken;
      refreshToken = response.data.tokens?.refreshToken;
    } else {
      // Fallback to direct properties (old format)
      user = response.user;
      accessToken = response.accessToken;
      refreshToken = response.refreshToken;
    }

    console.log("Parsed login data:", {
      user,
      accessToken: accessToken ? "Present" : "Missing",
      refreshToken: refreshToken ? "Present" : "Missing",
    });

    // Store tokens if login successful
    if (accessToken && refreshToken) {
      setTokens({
        accessToken,
        refreshToken,
      });
      console.log("Tokens stored in API service");
    }

    // Return in the format expected by authClient
    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async refreshTokens() {
    return await apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });
  },

  async requestPasswordReset(email) {
    return await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  async validateInviteToken(token) {
    return await apiRequest(`/auth/validate-invitation/${token}`, {
      skipAuth: true,
    });
  },

  async setupPassword(token, data) {
    const response = await apiRequest(`/auth/setup-password/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });

    // Store tokens if setup successful
    if (response.tokens?.accessToken && response.tokens?.refreshToken) {
      setTokens(response.tokens);
    }

    return response;
  },

  async resetPassword(token, password) {
    return await apiRequest(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
      skipAuth: true,
    });
  },

  async getProfile() {
    return await apiRequest("/auth/profile");
  },

  async updateProfile(profileData) {
    return await apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  async changePassword(currentPassword, newPassword) {
    return await apiRequest("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // User preferences management
  async updatePreferences(preferences) {
    return await apiRequest("/auth/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  },

  async getPreferences() {
    return await apiRequest("/auth/preferences");
  },

  // User activity and session management
  async getUserSessions() {
    return await apiRequest("/auth/sessions");
  },

  async terminateSession(sessionId) {
    return await apiRequest(`/auth/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  async terminateAllSessions() {
    return await apiRequest("/auth/sessions", {
      method: "DELETE",
    });
  },

  // Security features
  async enableTwoFactor() {
    return await apiRequest("/auth/2fa/enable", {
      method: "POST",
    });
  },

  async disableTwoFactor(code) {
    return await apiRequest("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  async verifyTwoFactor(code) {
    return await apiRequest("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  // Export user data (GDPR compliance)
  async exportUserData() {
    return await apiRequest("/auth/export-data");
  },

  // Delete user account
  async deleteAccount(password) {
    return await apiRequest("/auth/delete-account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  },

  // Notification endpoints (for ticket notifications only)
  async getNotifications({ page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const endpoint = `/notifications?${params.toString()}`;
    return await apiRequest(endpoint);
  },

  async getUnreadNotificationCount() {
    return await apiRequest("/notifications/unread-count");
  },

  async markNotificationAsRead(notificationId) {
    return await apiRequest(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },

  async markAllNotificationsAsRead() {
    return await apiRequest("/notifications/mark-all-read", {
      method: "PUT",
    });
  },

  async deleteNotification(notificationId) {
    return await apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },

  async clearAllReadNotifications() {
    return await apiRequest("/notifications/clear-read", {
      method: "DELETE",
    });
  },

  async getNotificationStats() {
    return await apiRequest("/notifications/stats");
  },

  // Admin-only user management endpoints
  async inviteUser(userData) {
    return await apiRequest("/auth/invite", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async getInvitations(params = {}) {
    const searchParams = new URLSearchParams();

    // Default params
    const defaultParams = { page: 1, limit: 50, ...params };

    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return await apiRequest(`/auth/invitations?${searchParams.toString()}`);
  },

  async getAuthStats() {
    return await apiRequest("/auth/stats");
  },

  async logout() {
    const result = await apiRequest("/auth/logout", {
      method: "POST",
    });
    clearTokens();
    return result;
  },

  // Analytics endpoints
  async getAnalyticsDashboard({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const endpoint = `/analytics/dashboard${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiRequest(endpoint);
  },

  async getAnalyticsCustomers({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const endpoint = `/analytics/customers${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiRequest(endpoint);
  },

  async getAnalyticsRecentActivity({ limit = 5 } = {}) {
    return await apiRequest(`/analytics/recent-activity?limit=${limit}`);
  },

  async getAnalyticsChatsPerDay({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const endpoint = `/analytics/chats-per-day${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiRequest(endpoint);
  },

  async getAnalyticsRevenueFromOrders({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const endpoint = `/analytics/revenue-from-orders${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiRequest(endpoint);
  },

  async getAnalyticsPerformance({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const endpoint = `/analytics/performance${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiRequest(endpoint);
  },

  // File Upload
  async uploadImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    return await apiRequest("/upload/images", {
      method: "POST",
      body: formData,
      // FormData will be detected and Content-Type will not be set
    });
  },

  // Document Upload
  async uploadFiles(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return await apiRequest("/upload/files", {
      method: "POST",
      body: formData,
      // FormData will be detected and Content-Type will not be set
    });
  },

  // Users
  async getAllUsers() {
    return await apiRequest("/auth/users");
  },
};

export { ApiError };
