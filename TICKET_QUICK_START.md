# 🎫 Quick Start - Dynamic Ticket System

## 🚀 Getting Started

### 1. Update Your Router

```javascript
// src/routes/router.jsx
import TicketsNew from "../pages/TicketsNew";
import TicketDetails from "../pages/TicketDetails";

// Add these routes:
<Route path="/tickets" element={<TicketsNew />} />
<Route path="/tickets/details" element={<TicketDetails />} />
```

### 2. Start Your Backend

```bash
# Make sure your backend is running on port 3000
npm start
```

### 3. Navigate to Tickets

```
http://localhost:5173/tickets
```

---

## 📖 Usage Examples

### View All Tickets

```javascript
// Navigate to tickets list
navigate("/tickets");

// The page will automatically:
// - Fetch all tickets from API
// - Show pagination
// - Enable filtering and search
```

### View Specific Ticket

```javascript
// Navigate with ticket number
navigate("/tickets/details?id=#100237");

// Or with numeric ID
navigate("/tickets/details?id=1");

// The page will automatically:
// - Fetch ticket details from API
// - Load conversation history
// - Show attachments
// - Enable status updates
```

### Filter Tickets

```javascript
// Click sidebar buttons:
- "All Tickets" → shows all
- "Open Tickets" → status=open
- "Pending Tickets" → status=pending
- "Resolved Tickets" → status=resolved

// Or use priority dropdown:
- "Urgent" → priority=urgent
- "High" → priority=high
- etc.
```

### Search Tickets

```javascript
// Type in search bar (auto-debounced 500ms):
- Customer email
- Order ID
- Ticket subject
- Ticket number
```

### Update Ticket Status

```javascript
// In ticket details page:
1. Click status dropdown in right sidebar
2. Select new status (open/pending/in_progress/resolved/closed)
3. Status automatically syncs with backend
```

---

## 🔌 API Endpoints Used

### Tickets List Page

```
GET /tickets?page=1&limit=10&status=open&priority=high&search=query
```

### Ticket Details Page

```
GET /tickets/#100237
PATCH /tickets/#100237/status
PATCH /tickets/#100237/assign
```

---

## 🎨 Features Available

### ✅ Working Now:

- Load tickets from API
- Pagination
- Search
- Filter by status
- Filter by priority
- View ticket details
- Update ticket status
- View attachments
- Switch between tickets
- Loading/error states

### ⏳ Coming Soon:

- Reply submission (UI ready)
- Tag updates (API needed)
- Priority updates (API needed)
- Bulk actions
- Real-time updates

---

## 🐛 Troubleshooting

### Tickets Not Loading?

```javascript
// Check:
1. Backend is running on port 3000
2. CORS is enabled on backend
3. Check browser console for errors
4. Verify API endpoint: http://localhost:3000/tickets
```

### "No Ticket Selected" Error?

```javascript
// Make sure you're navigating with the ID parameter:
navigate("/tickets/details?id=#100237");

// Not just:
navigate("/tickets/details"); // ❌ Wrong
```

### Status Updates Not Saving?

```javascript
// Check:
1. User has admin privileges
2. JWT token is valid
3. Backend endpoint is working
4. Check network tab for 401/403 errors
```

---

## 📊 Data Structure

### Ticket Object:

```javascript
{
  id: 1,
  ticket_number: "#100237",
  customer_name: "John Doe",
  customer_email: "john@example.com",
  subject: "Order Issue",
  description: "Product damaged",
  issue_type: "defect_quality",
  priority: "high",
  status: "open",
  attachments: ["url1", "url2"],
  shopify_order_id: "5234829854",
  shopify_order_name: "#SPFY329854",
  assigned_to: "agent@company.com",
  tags: ["defect", "urgent"],
  created_at: "2025-10-09T10:15:00Z",
  updated_at: "2025-10-26T14:30:00Z"
}
```

---

## 🎯 Quick Tips

1. **Use ticket_number for navigation** - More user-friendly than numeric IDs
2. **Search is debounced** - Wait 500ms after typing for results
3. **Status changes are instant** - No need to refresh
4. **Pagination resets on filter** - Expected behavior
5. **Check console for errors** - Detailed logging enabled

---

## 📞 Support

**Documentation:**

- Full Implementation: `TICKET_DYNAMIC_IMPLEMENTATION.md`
- API Reference: `TICKET_API_REFERENCE.md`

**Code Files:**

- Service: `src/services/ticketService.js`
- Hooks: `src/hooks/useTickets.js`, `src/hooks/useTicketDetails.js`
- Pages: `src/pages/TicketsNew.jsx`, `src/pages/TicketDetails.jsx`

---

**Ready to use! 🎉**
