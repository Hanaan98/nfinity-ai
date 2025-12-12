// src/hooks/useTicketDetails.js
import { useState, useEffect, useCallback } from "react";
import { ticketApi } from "../services/ticketService";

/**
 * Custom hook for fetching and managing a single ticket's details
 * @param {string} ticketIdentifier - Ticket ID or ticket number
 * @returns {Object} Ticket data, loading state, error, and action functions
 */
export function useTicketDetails(ticketIdentifier) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = useCallback(async () => {
    if (!ticketIdentifier) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching ticket:", ticketIdentifier);
      const response = await ticketApi.getTicket(ticketIdentifier);

      console.log("Ticket API response:", response);
      console.log("Response structure:", {
        success: response.success,
        hasData: !!response.data,
        hasTicket: !!response.ticket,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataKeys: response.data ? Object.keys(response.data) : null,
      });

      // Handle response format
      if (response.success) {
        let ticketData = response.data || response.ticket;

        // If data is an array, find the ticket by ticket_number or id
        if (Array.isArray(ticketData)) {
          console.log(
            "Response is an array, searching for ticket:",
            ticketIdentifier
          );
          ticketData = ticketData.find(
            (t) =>
              t.ticket_number === ticketIdentifier ||
              t.id === ticketIdentifier ||
              t.id === parseInt(ticketIdentifier)
          );
          console.log("Found ticket:", ticketData);
        }

        console.log("Ticket data extracted:", ticketData);
        console.log(
          "Ticket data keys:",
          ticketData ? Object.keys(ticketData) : null
        );
        console.log("Full ticket object:", JSON.stringify(ticketData, null, 2));
        setTicket(ticketData);
      } else {
        throw new Error(response.error || "Failed to fetch ticket");
      }
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError(err.message || "Failed to load ticket");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketIdentifier]);

  // Fetch ticket when identifier changes
  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  /**
   * Update ticket status
   * @param {string} status - New status
   * @param {string} resolutionNotes - Optional resolution notes
   * @param {string} assignedTo - Optional agent email
   * @returns {Promise<boolean>} Success status
   */
  const updateStatus = useCallback(
    async (status, resolutionNotes = null, assignedTo = null) => {
      if (!ticket) return false;

      setUpdating(true);
      setError(null);

      try {
        console.log("Updating ticket status:", {
          status,
          resolutionNotes,
          assignedTo,
        });
        const response = await ticketApi.updateTicketStatus(
          ticket.ticket_number || ticket.id,
          status,
          resolutionNotes,
          assignedTo
        );

        if (response.success) {
          setTicket(response.data || response.ticket);
          return true;
        } else {
          throw new Error(response.error || "Failed to update status");
        }
      } catch (err) {
        console.error("Error updating ticket status:", err);
        setError(err.message || "Failed to update status");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [ticket]
  );

  /**
   * Assign ticket to an agent
   * @param {string} agentEmail - Agent email address
   * @returns {Promise<boolean>} Success status
   */
  const assignAgent = useCallback(
    async (agentEmail) => {
      if (!ticket) return false;

      setUpdating(true);
      setError(null);

      try {
        console.log("Assigning ticket to agent:", agentEmail);
        const response = await ticketApi.assignTicket(
          ticket.ticket_number || ticket.id,
          agentEmail
        );

        if (response.success) {
          setTicket(response.data || response.ticket);
          return true;
        } else {
          throw new Error(response.error || "Failed to assign ticket");
        }
      } catch (err) {
        console.error("Error assigning ticket:", err);
        setError(err.message || "Failed to assign ticket");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [ticket]
  );

  /**
   * Add attachment to ticket
   * @param {string} attachmentUrl - URL of the attachment
   * @returns {Promise<boolean>} Success status
   */
  const addAttachment = useCallback(
    async (attachmentUrl) => {
      if (!ticket) return false;

      setUpdating(true);
      setError(null);

      try {
        console.log("Adding attachment to ticket:", attachmentUrl);
        const response = await ticketApi.addAttachment(
          ticket.ticket_number || ticket.id,
          attachmentUrl
        );

        if (response.success) {
          setTicket(response.data || response.ticket);
          return true;
        } else {
          throw new Error(response.error || "Failed to add attachment");
        }
      } catch (err) {
        console.error("Error adding attachment:", err);
        setError(err.message || "Failed to add attachment");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [ticket]
  );

  /**
   * Refresh ticket data
   */
  const refresh = useCallback(() => {
    fetchTicket();
  }, [fetchTicket]);

  /**
   * Update ticket priority
   * @param {string} priority - New priority
   * @returns {Promise<boolean>} Success status
   */
  const updatePriority = useCallback(
    async (priority) => {
      if (!ticket) return false;

      setUpdating(true);
      setError(null);

      try {
        console.log("Updating ticket priority:", priority);
        const response = await ticketApi.updateTicketPriority(
          ticket.ticket_number || ticket.id,
          priority
        );

        if (response.success) {
          setTicket(response.data || response.ticket);
          return true;
        } else {
          throw new Error(response.error || "Failed to update priority");
        }
      } catch (err) {
        console.error("Error updating ticket priority:", err);
        setError(err.message || "Failed to update priority");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [ticket]
  );

  /**
   * Update ticket type
   * @param {string} issue_type - New issue type
   * @returns {Promise<boolean>} Success status
   */
  const updateType = useCallback(
    async (issue_type) => {
      if (!ticket) return false;

      setUpdating(true);
      setError(null);

      try {
        console.log("Updating ticket type:", issue_type);
        const response = await ticketApi.updateTicketType(
          ticket.ticket_number || ticket.id,
          issue_type
        );

        if (response.success) {
          setTicket(response.data || response.ticket);
          return true;
        } else {
          throw new Error(response.error || "Failed to update type");
        }
      } catch (err) {
        console.error("Error updating ticket type:", err);
        setError(err.message || "Failed to update type");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [ticket]
  );

  /**
   * Send a reply to the ticket
   * @param {Object} replyData - Reply data
   * @returns {Promise<Object|null>} Created reply or null if failed
   */
  const sendReply = useCallback(
    async (replyData) => {
      if (!ticket) return null;

      setUpdating(true);
      setError(null);

      try {
        console.log("Sending reply to ticket:", replyData);
        const response = await ticketApi.sendReply(
          ticket.ticket_number || ticket.id,
          replyData
        );

        if (response.success) {
          // Refresh ticket data to get updated replies
          await fetchTicket();
          return response.data || response.reply;
        } else {
          throw new Error(response.error || "Failed to send reply");
        }
      } catch (err) {
        console.error("Error sending reply:", err);
        setError(err.message || "Failed to send reply");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [ticket, fetchTicket]
  );

  /**
   * Load replies for the ticket
   * @returns {Promise<Array>} Array of replies
   */
  const loadReplies = useCallback(async () => {
    if (!ticket) return [];

    try {
      console.log(
        "Loading replies for ticket:",
        ticket.ticket_number || ticket.id
      );
      const response = await ticketApi.getTicketReplies(
        ticket.ticket_number || ticket.id
      );

      if (response.success) {
        const replies = response.data || response.replies || [];
        console.log("Loaded replies:", replies);
        return replies;
      } else {
        throw new Error(response.error || "Failed to load replies");
      }
    } catch (err) {
      console.error("Error loading replies:", err);
      return [];
    }
  }, [ticket]);

  /**
   * Update ticket tags
   * @param {Array<string>} tags - Array of tags
   * @returns {Promise<boolean>} Success status
   */
  const updateTags = useCallback(
    async (tags) => {
      if (!ticket) return false;

      setUpdating(true);
      setError(null);

      try {
        console.log("Updating ticket tags:", tags);
        const response = await ticketApi.updateTicketTags(
          ticket.ticket_number || ticket.id,
          tags
        );

        if (response.success) {
          // Merge the response with existing ticket data to preserve all fields
          const updatedTicket = response.data || response.ticket;
          setTicket(prevTicket => ({
            ...prevTicket,
            ...updatedTicket,
            tags: updatedTicket.tags,
            // Preserve parsed fields that might not come from API
            parsedTags: Array.isArray(updatedTicket.tags) 
              ? updatedTicket.tags 
              : (typeof updatedTicket.tags === 'string' ? JSON.parse(updatedTicket.tags) : []),
            parsedAttachments: prevTicket.parsedAttachments,
            parsedMetadata: prevTicket.parsedMetadata,
          }));
          return true;
        } else {
          throw new Error(response.error || "Failed to update tags");
        }
      } catch (err) {
        console.error("Error updating ticket tags:", err);
        setError(err.message || "Failed to update tags");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [ticket]
  );

  /**
   * Update local ticket data (for optimistic updates)
   * @param {Object} updates - Ticket updates
   */
  const updateLocal = useCallback((updates) => {
    setTicket((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return {
    ticket,
    loading,
    error,
    updating,
    updateStatus,
    updatePriority,
    updateType,
    updateTags,
    assignAgent,
    addAttachment,
    sendReply,
    loadReplies,
    refresh,
    updateLocal,
  };
}
