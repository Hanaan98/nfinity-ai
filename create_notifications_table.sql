-- Create notifications table for the nfinity database
-- Run this SQL script in your MySQL database

USE nfinity;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,                    -- NULL = global notification for all users
  type ENUM('new_ticket', 'new_message', 'status_changed', 'long_wait_time', 'chat_escalated', 'order_issue', 'order_update', 'system_alert', 'system') NOT NULL,   -- Notification type (expandable)
  title VARCHAR(255) NOT NULL,        -- Notification title
  message TEXT NOT NULL,              -- Detailed message
  data JSON NULL,                     -- Additional metadata (ticket info, etc.)
  isRead BOOLEAN DEFAULT FALSE,       -- Read status
  actionUrl VARCHAR(512) NULL,        -- URL to navigate when clicked
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium', -- Priority level
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Creation timestamp
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP   -- Last update timestamp
);

-- Create index for performance
CREATE INDEX idx_notifications_userId_isRead ON notifications(userId, isRead);
CREATE INDEX idx_notifications_createdAt ON notifications(createdAt DESC);

-- Insert some sample notifications for testing
INSERT INTO notifications (userId, type, title, message, data, isRead, actionUrl, priority) VALUES
(1, 'new_ticket', '🎫 New Support Ticket #001', 'A customer has submitted a new support ticket regarding shipping delays.', JSON_OBJECT('ticketId', 1, 'priority', 'high', 'category', 'shipping', 'customerId', 123), FALSE, '/tickets/1', 'high'),
(NULL, 'system_alert', '⚙️ System Maintenance Notice', 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST. Services may be temporarily unavailable.', JSON_OBJECT('maintenanceWindow', '2:00 AM - 4:00 AM EST', 'affectedServices', JSON_ARRAY('chat', 'notifications')), FALSE, '/system/maintenance', 'medium'),
(1, 'new_message', '💬 Customer Inquiry #002', 'A customer is asking about product availability and pricing for bulk orders.', JSON_OBJECT('sessionId', 'session-456', 'customerEmail', 'customer@example.com', 'conversationType', 'sales_inquiry'), TRUE, '/chats/session-456', 'low');

-- Show the created table structure
DESCRIBE notifications;

-- Show sample data
SELECT * FROM notifications ORDER BY createdAt DESC;