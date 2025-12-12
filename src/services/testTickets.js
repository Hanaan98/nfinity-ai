// Simple test to check ticket API connection
import { ticketApi } from "./ticketService.js";

export async function testTicketConnection() {
  try {
    console.log("🧪 Testing ticket API connection...");
    
    // Test getting all tickets
    const response = await ticketApi.getAllTickets({ page: 1, limit: 5 });
    
    console.log("✅ Ticket API connection successful:", response);
    return { success: true, data: response };
  } catch (error) {
    console.error("❌ Ticket API connection failed:", error);
    return { success: false, error: error.message };
  }
}

// Run test if this file is called directly
if (typeof window !== 'undefined') {
  testTicketConnection();
}