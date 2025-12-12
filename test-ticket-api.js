// Quick test script to check ticket API functionality
import { ticketApi } from "./src/services/ticketService.js";

async function testTicketAPI() {
  console.log("Testing Ticket API...");

  try {
    // Test getting all tickets
    console.log("1. Testing getAllTickets...");
    const allTickets = await ticketApi.getAllTickets({ page: 1, limit: 5 });
    console.log("✅ getAllTickets:", allTickets);

    if (allTickets.success && allTickets.data && allTickets.data.length > 0) {
      const firstTicket = allTickets.data[0];
      console.log("First ticket:", firstTicket);

      // Test getting single ticket
      console.log("\n2. Testing getTicket...");
      const singleTicket = await ticketApi.getTicket(firstTicket.ticket_number);
      console.log("✅ getTicket:", singleTicket);

      // Test updating status
      console.log("\n3. Testing updateTicketStatus...");
      const originalStatus = firstTicket.status;
      const newStatus = originalStatus === "open" ? "pending" : "open";

      const statusUpdate = await ticketApi.updateTicketStatus(
        firstTicket.ticket_number,
        newStatus
      );
      console.log("✅ updateTicketStatus:", statusUpdate);

      // Revert status
      await ticketApi.updateTicketStatus(
        firstTicket.ticket_number,
        originalStatus
      );
      console.log("✅ Status reverted");
    }
  } catch (error) {
    console.error("❌ API Test failed:", error);

    if (error.status === 401) {
      console.log(
        "📝 Note: Authentication error - make sure you are logged in"
      );
    } else if (error.status === 404) {
      console.log("📝 Note: Endpoint not found - check backend server");
    } else if (error.status === 0) {
      console.log(
        "📝 Note: Network error - check if backend server is running"
      );
    }
  }
}

// Run the test
testTicketAPI();
