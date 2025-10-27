# 🔔 Smart Notification System - Implementation Guide

## Overview

Your Nfinity AI Dashboard now features a **complete priority-based smart notification system** that intelligently categorizes and alerts you about customer interactions. The system is fully integrated and ready to work with your backend.

---

## ✨ Features Implemented

### 🎯 **Priority-Based Notifications**

| Priority      | Color  | Use Case                                   | Auto-Close Time | Sound               |
| ------------- | ------ | ------------------------------------------ | --------------- | ------------------- |
| 🔴 **URGENT** | Red    | Long wait times (30+ min), Critical issues | 10 seconds      | High pitch, longer  |
| 🟠 **HIGH**   | Orange | Support tickets, Chat escalations          | 8 seconds       | Medium pitch        |
| 🟡 **MEDIUM** | Yellow | Order tracking inquiries                   | 5 seconds       | Standard pitch      |
| 🟢 **LOW**    | Green  | General conversations, Status updates      | 4 seconds       | Lower pitch, softer |

### 🧠 **Smart Categorization**

The system automatically detects conversation types and assigns appropriate priorities:

```javascript
// Examples of automatic detection:
"Where is my order #12345?" → MEDIUM priority (Order Tracking)
Customer waiting 35 minutes → URGENT priority (Long Wait Time)
New support ticket created → HIGH priority (Support Ticket)
General chat started → LOW priority (General Conversation)
```

### 🎨 **Enhanced UI Components**

#### **NotificationBell**

- Animated bounce on new notifications
- Unread count badge with pulse animation
- Connection status indicator
- Priority-based urgent animations

#### **NotificationItem**

- Priority-based color coding and borders
- Type badges (Support Ticket, Order Inquiry, etc.)
- Customer email and wait time display
- Urgent notifications have pulsing borders
- Enhanced dark theme support

#### **Toast Notifications**

- Priority-based styling and icons
- Different auto-close times per priority
- Click to navigate to relevant page
- Duplicate prevention

#### **Sound System**

- Different pitch/duration per priority
- User-configurable sound preferences
- Urgent notifications use distinctive sound

---

## 🚀 Testing Your System

### **Development Test Buttons**

In development mode, you'll see test buttons in the header:

- 🚨 **Urgent Wait** - Simulates long wait time notification
- 🎫 **Support Ticket** - Simulates new support ticket
- 💬 **Order Inquiry** - Simulates order tracking message
- ✅ **Status Update** - Simulates status change notification

### **Manual Testing via Console**

```javascript
// Test urgent notification
notificationService.sendTestNotification("long_wait_time", "urgent");

// Test order tracking inquiry
notificationService.sendTestNotification("new_message", "medium");

// Test support ticket
notificationService.sendTestNotification("new_ticket", "high");
```

---

## 🔧 Backend Integration Requirements

Your backend needs to implement these components for full functionality:

### **1. Socket.IO Server Setup**

```javascript
// Socket.IO initialization with JWT authentication
const io = require("socket.io")(server, {
  cors: { origin: "http://localhost:5173" },
});

// JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token here
  if (validToken) {
    socket.userId = decodedToken.userId;
    next();
  } else {
    next(new Error("Authentication failed"));
  }
});
```

### **2. Notification Broadcasting**

```javascript
// Function to broadcast notifications
const broadcastNotification = async (notificationData) => {
  // Save to database
  const notification = await Notification.create({
    userId: notificationData.userId,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    priority: notificationData.priority,
    data: notificationData.data,
    actionUrl: notificationData.actionUrl,
  });

  // Broadcast via Socket.IO
  io.to(`user_${notificationData.userId}`).emit("notification", notification);

  // Update unread count
  const unreadCount = await Notification.count({
    where: { userId: notificationData.userId, isRead: false },
  });
  io.to(`user_${notificationData.userId}`).emit("unreadCount", unreadCount);
};
```

### **3. Chat Message Handler (Auto-Detection)**

```javascript
// In your chat controller
const handleNewMessage = async (sessionId, message, customerInfo) => {
  // Detect conversation type
  const conversationType = detectConversationType(message);

  // Send appropriate notification
  if (conversationType === "order_tracking") {
    await broadcastNotification({
      userId: getAllAdminUserIds(), // Broadcast to all admins
      type: "new_message",
      title: "Order Tracking Inquiry",
      message: `${customerInfo.email} is asking about an order`,
      priority: "medium",
      data: {
        sessionId,
        customerEmail: customerInfo.email,
        conversationType,
        messagePreview: message.substring(0, 100),
      },
      actionUrl: `/chats/${sessionId}`,
    });
  } else if (conversationType === "general") {
    await broadcastNotification({
      type: "new_message",
      title: "New Chat",
      message: `New conversation started`,
      priority: "low",
      // ... other data
    });
  }
};

// Conversation type detection
const detectConversationType = (message) => {
  const orderKeywords = ["order", "#", "tracking", "shipment", "delivery"];
  const supportKeywords = ["problem", "issue", "help", "support", "broken"];

  const lowerMessage = message.toLowerCase();

  if (orderKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return "order_tracking";
  } else if (
    supportKeywords.some((keyword) => lowerMessage.includes(keyword))
  ) {
    return "support";
  }

  return "general";
};
```

### **4. Support Ticket Handler**

```javascript
// When customer info is saved with support contact type
const handleCustomerInfoUpdate = async (sessionId, customerInfo) => {
  if (customerInfo.contactType === "support") {
    await broadcastNotification({
      type: "new_ticket",
      title: "New Support Ticket",
      message: `${customerInfo.email} needs assistance`,
      priority: "high",
      data: {
        sessionId,
        customerEmail: customerInfo.email,
        contactType: "support",
      },
      actionUrl: `/chats/${sessionId}`,
    });
  }
};
```

### **5. Long Wait Time Monitor**

```javascript
// Background scheduler (run every 5 minutes)
const checkLongWaitTimes = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const stalledConversations = await Conversation.findAll({
    where: {
      status: ["active", "waiting"],
      lastMessageAt: { [Op.lte]: thirtyMinutesAgo },
      // Only conversations that haven't already triggered this alert
      longWaitAlertSent: { [Op.ne]: true },
    },
    include: [{ model: Customer }],
  });

  for (const conversation of stalledConversations) {
    const waitTimeMinutes = Math.floor(
      (Date.now() - new Date(conversation.lastMessageAt)) / (1000 * 60)
    );

    await broadcastNotification({
      type: "long_wait_time",
      title: "⚠️ Customer Waiting Too Long",
      message: `${conversation.Customer.email} has been waiting for ${waitTimeMinutes} minutes`,
      priority: "urgent",
      data: {
        sessionId: conversation.sessionId,
        customerEmail: conversation.Customer.email,
        waitTimeMinutes,
        lastMessageAt: conversation.lastMessageAt,
      },
      actionUrl: `/chats/${conversation.sessionId}`,
    });

    // Mark as alerted to prevent duplicates
    await conversation.update({ longWaitAlertSent: true });
  }
};

// Clear alert flag when customer sends new message
const handleCustomerReply = async (sessionId) => {
  await Conversation.update(
    { longWaitAlertSent: false },
    { where: { sessionId } }
  );
};

// Run scheduler every 5 minutes
setInterval(checkLongWaitTimes, 5 * 60 * 1000);
```

### **6. REST API Endpoints**

```javascript
// Get notifications
app.get("/api/notifications", authenticateToken, async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const where = { userId: req.user.id };
  if (unreadOnly === "true") {
    where.isRead = false;
  }

  const notifications = await Notification.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });

  res.json({
    success: true,
    data: {
      notifications: notifications.rows,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        hasNext: page * limit < notifications.count,
      },
    },
  });
});

// Get unread count
app.get(
  "/api/notifications/unread-count",
  authenticateToken,
  async (req, res) => {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ success: true, data: { unreadCount: count } });
  }
);

// Mark as read
app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { id: req.params.id, userId: req.user.id } }
  );

  // Broadcast update
  io.to(`user_${req.user.id}`).emit("notificationUpdate", {
    type: "marked_read",
    notificationId: req.params.id,
  });

  res.json({ success: true });
});

// Mark all as read
app.put(
  "/api/notifications/mark-all-read",
  authenticateToken,
  async (req, res) => {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    // Broadcast unread count update
    io.to(`user_${req.user.id}`).emit("unreadCount", 0);

    res.json({ success: true });
  }
);
```

---

## 📊 Expected Notification Data Structure

```javascript
{
  id: 123,
  type: "new_message" | "new_ticket" | "chat_escalated" | "long_wait_time" | "order_issue" | "order_update" | "status_changed" | "system_alert",
  title: "Order Tracking Inquiry",
  message: "customer@email.com is asking about an order",
  priority: "urgent" | "high" | "medium" | "low",
  isRead: false,
  data: {
    sessionId: "abc123",
    customerEmail: "customer@email.com",
    conversationType: "order_tracking",
    waitTimeMinutes: 35, // for long_wait_time type
    messagePreview: "Where is my order?", // for new_message type
    // ... other contextual data
  },
  actionUrl: "/chats/abc123",
  createdAt: "2025-10-26T10:30:00Z",
  userId: 456
}
```

---

## ⚙️ Configuration Options

### **User Preferences (localStorage)**

```javascript
// Sound settings
localStorage.setItem("notificationSound", "true"); // Master sound toggle
localStorage.setItem("urgentNotificationSound", "true"); // Urgent sounds
localStorage.setItem("mediumNotificationSound", "true"); // Medium/low sounds

// Notification settings
localStorage.setItem("browserNotifications", "true"); // Browser notifications
localStorage.setItem("longWaitThreshold", "30"); // Minutes before urgent alert
```

### **Server Configuration**

```javascript
// notification_config.js
module.exports = {
  LONG_WAIT_THRESHOLD_MINUTES: 30,
  CHECK_INTERVAL_MINUTES: 5,
  MAX_NOTIFICATIONS_PER_USER: 1000,
  AUTO_CLEAR_READ_AFTER_DAYS: 30,
  PRIORITY_LEVELS: ["low", "medium", "high", "urgent"],
};
```

---

## 🎯 Usage Examples

### **Example 1: Customer Asks About Order**

```
Customer: "Where is my order #12345?"
↓
Backend detects "order" keywords
↓
Sends MEDIUM priority notification
↓
Frontend shows yellow toast with order icon
↓
Plays standard notification sound
↓
Bell shows unread count badge
```

### **Example 2: Customer Waiting 35 Minutes**

```
Background scheduler detects 35-minute wait
↓
Sends URGENT priority notification
↓
Frontend shows red toast with warning icon
↓
Plays urgent sound (higher pitch, longer)
↓
Bell bounces and shows red pulsing badge
↓
Notification item has pulsing red border
```

### **Example 3: New Support Ticket**

```
Customer submits contact form with "support" type
↓
Backend sends HIGH priority notification
↓
Frontend shows orange toast with ticket icon
↓
Plays high priority sound
↓
Notification appears in panel with "Support Ticket" badge
```

---

## 🚀 Quick Start Deployment

1. **Frontend** (Already Complete ✅)

   - Notification service configured
   - UI components ready
   - Toast and sound system active
   - Test buttons available in dev mode

2. **Backend Setup**

   ```bash
   npm install socket.io jsonwebtoken
   ```

3. **Database Schema**

   ```sql
   CREATE TABLE notifications (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL,
     type VARCHAR(50) NOT NULL,
     title VARCHAR(255) NOT NULL,
     message TEXT,
     priority VARCHAR(20) DEFAULT 'medium',
     data JSONB,
     action_url VARCHAR(500),
     is_read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Environment Variables**
   ```bash
   SOCKET_IO_ORIGIN=http://localhost:5173
   JWT_SECRET=your-secret-key
   NOTIFICATION_CHECK_INTERVAL=300000  # 5 minutes
   LONG_WAIT_THRESHOLD=1800000        # 30 minutes
   ```

---

## 🔧 Troubleshooting

### **No Notifications Appearing**

1. Check if Socket.IO connection is established (look for ✅ in console)
2. Verify JWT token is being sent correctly
3. Test with development buttons in header
4. Check backend is broadcasting to correct user room

### **Sounds Not Playing**

1. Check `localStorage.getItem('notificationSound')` is not `'false'`
2. Verify browser allows autoplay (may need user interaction first)
3. Check browser console for audio context errors

### **Wrong Priority Colors**

1. Verify `notification.priority` field is being sent from backend
2. Check if Tailwind CSS classes are loading correctly
3. Ensure dark theme classes are applied

---

## 📈 Analytics & Monitoring

Track notification effectiveness:

```javascript
// Backend analytics
const trackNotificationStats = {
  sent: 0,
  read: 0,
  clicked: 0,
  byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
  byType: { new_ticket: 0, new_message: 0, long_wait_time: 0 },
};

// Frontend click tracking
const handleNotificationClick = (notification) => {
  // Track click analytics
  analytics.track("notification_clicked", {
    type: notification.type,
    priority: notification.priority,
    timeToClick: Date.now() - new Date(notification.createdAt),
  });
};
```

---

**Your smart notification system is now ready! 🎉**

The frontend is fully implemented and waiting for your backend integration. Use the test buttons to verify functionality, then implement the backend components for full automation.

**Questions or issues?** Check the browser console for connection status and notification logs.
