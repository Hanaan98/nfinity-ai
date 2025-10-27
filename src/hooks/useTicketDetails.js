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
    assignAgent,
    addAttachment,
    refresh,
    updateLocal,
  };
}
