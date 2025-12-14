// src/services/ticketService.js
import { getAccessToken } from "./api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class TicketApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "TicketApiError";
    this.status = status;
    this.data = data;
  }
}

async function ticketApiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header for admin endpoints
  const accessToken = getAccessToken();
  if (accessToken && !options.skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: response.statusText || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      const errorMessage =
        errorData.error ||
        errorData.message ||
        `Request failed with status ${response.status}`;

      throw new TicketApiError(errorMessage, response.status, errorData);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if (error instanceof TicketApiError) {
      throw error;
    }

    throw new TicketApiError(
      "Network error. Please check your connection and try again.",
      0,
      { originalError: error.message, type: "network" }
    );
  }
}

export const ticketApi = {
  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Create a new ticket (public endpoint - used by chatbot)
   * @param {Object} ticketData - Ticket data
   * @returns {Promise<Object>} Created ticket
   */
  async createTicket(ticketData) {
    return await ticketApiRequest("/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
      skipAuth: true, // Public endpoint
    });
  },

  /**
   * Get a specific ticket by ID or ticket number
   * @param {string} identifier - Ticket ID or ticket number (e.g., "#100237")
   * @returns {Promise<Object>} Ticket details
   */
  async getTicket(identifier) {
    return await ticketApiRequest(`/tickets/${encodeURIComponent(identifier)}`);
  },

  /**
   * Get all tickets for a specific customer by email (public)
   * @param {string} email - Customer email
   * @returns {Promise<Object>} Customer tickets
   */
  async getCustomerTickets(email) {
    return await ticketApiRequest(
      `/tickets/customer/${encodeURIComponent(email)}`,
      {
        skipAuth: true, // Public endpoint
      }
    );
  },

  /**
   * Get all tickets for a specific order (public)
   * @param {string} orderId - Shopify order ID
   * @returns {Promise<Object>} Order tickets
   */
  async getOrderTickets(orderId) {
    return await ticketApiRequest(
      `/tickets/order/${encodeURIComponent(orderId)}`,
      {
        skipAuth: true, // Public endpoint
      }
    );
  },

  /**
   * Add attachment to ticket (public)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {string} attachmentUrl - URL of the attachment
   * @returns {Promise<Object>} Updated ticket
   */
  async addAttachment(identifier, attachmentUrl) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/attachments`,
      {
        method: "POST",
        body: JSON.stringify({ attachment_url: attachmentUrl }),
        skipAuth: true, // Public endpoint
      }
    );
  },

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all tickets with filtering and pagination (admin)
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Tickets list with pagination
   */
  async getAllTickets(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      issue_type,
      customer_email,
      shopify_order_id,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    if (issue_type) params.append("issue_type", issue_type);
    if (customer_email) params.append("customer_email", customer_email);
    if (shopify_order_id) params.append("shopify_order_id", shopify_order_id);
    if (search) params.append("search", search);

    return await ticketApiRequest(`/tickets/admin?${params.toString()}`);
  },

  /**
   * Update ticket status (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {string} status - New status (open|pending|in_progress|resolved|closed)
   * @param {string} resolution_notes - Optional resolution notes
   * @param {string} assigned_to - Optional agent email
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicketStatus(
    identifier,
    status,
    resolution_notes = null,
    assigned_to = null
  ) {
    const body = { status };
    if (resolution_notes) body.resolution_notes = resolution_notes;
    if (assigned_to) body.assigned_to = assigned_to;

    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * Assign ticket to agent (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {string} agentEmail - Agent email address
   * @returns {Promise<Object>} Updated ticket
   */
  async assignTicket(identifier, agentEmail) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/assign`,
      {
        method: "PATCH",
        body: JSON.stringify({ agent_email: agentEmail }),
      }
    );
  },

  /**
   * Get ticket statistics (admin)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    return await ticketApiRequest("/tickets/admin/stats");
  },

  /**
   * Get overdue tickets (admin)
   * @returns {Promise<Object>} Overdue tickets
   */
  async getOverdueTickets() {
    return await ticketApiRequest("/tickets/admin/overdue");
  },

  /**
   * Update ticket priority (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {string} priority - New priority (low|medium|high|urgent)
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicketPriority(identifier, priority) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/priority`,
      {
        method: "PATCH",
        body: JSON.stringify({ priority }),
      }
    );
  },

  /**
   * Update ticket type (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {string} issue_type - New issue type
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicketType(identifier, issue_type) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/type`,
      {
        method: "PATCH",
        body: JSON.stringify({ issue_type }),
      }
    );
  },

  /**   * Toggle ticket starred status (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {boolean} is_starred - Whether ticket is starred
   * @returns {Promise<Object>} Updated ticket
   */
  async toggleStarred(identifier, is_starred) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/starred`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_starred }),
      }
    );
  },

  /**   * Update ticket tags (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {Array<string>} tags - Array of tags
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicketTags(identifier, tags) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/tags`,
      {
        method: "PATCH",
        body: JSON.stringify({ tags }),
      }
    );
  },

  /**
   * Close/Delete ticket (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @returns {Promise<Object>} Success message
   */
  async closeTicket(identifier) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * Get replies for a specific ticket
   * @param {string} identifier - Ticket ID or ticket number
   * @returns {Promise<Object>} Ticket replies
   */
  async getTicketReplies(identifier) {
    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/replies`
    );
  },

  /**
   * Send a reply to a ticket (admin)
   * @param {string} identifier - Ticket ID or ticket number
   * @param {Object} replyData - Reply data
   * @returns {Promise<Object>} Created reply
   */
  async sendReply(identifier, replyData) {
    const {
      message,
      author_email,
      author_name,
      is_staff_reply = true,
      is_public = true,
      cc = [],
      bcc = [],
      attachments = [],
    } = replyData;

    return await ticketApiRequest(
      `/tickets/${encodeURIComponent(identifier)}/replies`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
          author_email,
          author_name,
          is_staff_reply,
          is_public,
          cc,
          bcc,
          attachments,
        }),
      }
    );
  },
};

export { TicketApiError };
