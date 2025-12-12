import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTicketDetails } from "../hooks/useTicketDetails";
import { useAuth } from "../auth/AuthProvider";
import SimpleTextEditor from "../components/SimpleTextEditor";
import { chatApi } from "../services/api";
import {
  ChevronDown,
  Paperclip,
  Smile,
  X,
  Eye,
  Star,
  MoreHorizontal,
  Archive,
  Image,
  File,
  Download,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Demo data for development - remove in production
const DEMO_TICKETS = import.meta.env.DEV
  ? [
      {
        id: "109237",
        subject: "Order Status Issue - Urgent Shipping Delay",
        type: "Question",
        status: "Open",
        priority: "High",
        channel: "Email",
        created: "Oct 9, 2024 10:15 AM",
        updated: "Oct 26, 2024 2:30 PM",
        requester: {
          name: "Michelle Baftiari",
          email: "michelle.baftiari@example.com",
          phone: "+1 (555) 123-4567",
          company: "Tech Solutions Inc.",
          avatar: "MB",
          timezone: "PST",
          language: "English",
          tags: ["VIP", "Premium"],
        },
        assignee: {
          name: "Alex Johnson",
          email: "alex.johnson@company.com",
          avatar: "AJ",
          role: "Senior Support Agent",
        },
        organization: "Tech Solutions Inc.",
        group: "Customer Success",
        tags: ["shipping", "urgent", "payment", "order-status"],
        followers: ["Sarah Chen", "Mike Ross"],
        replies: [
          {
            id: "msg1",
            type: "customer",
            author: "Michelle Baftiari",
            email: "michelle.baftiari@example.com",
            timestamp: "Oct 9, 2024 10:15 AM",
            content: `Hi Support Team,

I've been trying to get an update on my order placed back in August and I'm getting quite frustrated with the lack of communication. 

Order Details:
- Order Number: SPY324027
- Placed: August 28, 2024
- Product: Athletic Shoes (Size 8.5)
- Total Paid: $189.99

Issues:
1. The shoes show as "available" on your website but my order hasn't shipped
2. No tracking information provided
3. Customer service hasn't responded to my previous emails

At this point, I would prefer to cancel the order and get a full refund unless someone can provide a clear explanation and immediate resolution.

Thanks,
Michelle`,
            attachments: [],
            via: "Email",
            isPublic: true,
          },
          {
            id: "msg2",
            type: "internal",
            author: "Alex Johnson",
            email: "alex.johnson@company.com",
            timestamp: "Oct 9, 2024 11:30 AM",
            content: `Internal Note:

Checked the order status - there was a warehouse issue that wasn't communicated to the customer. Order SPY324027 was delayed due to inventory sync problems.

Actions taken:
- Escalated to fulfillment team
- Requested priority shipping
- Customer should receive tracking by EOD

Will follow up with public response.`,
            attachments: [],
            via: "Web",
            isPublic: false,
          },
          {
            id: "msg3",
            type: "agent",
            author: "Alex Johnson",
            email: "alex.johnson@company.com",
            timestamp: "Oct 9, 2024 12:45 PM",
            content: `Hi Michelle,

Thank you for reaching out, and I sincerely apologize for the delay and lack of communication regarding your order.

I've personally investigated your order SPY324027 and found that there was an unexpected inventory synchronization issue that caused the delay. This should have been communicated to you immediately, and I take full responsibility for this oversight.

Immediate Actions Taken:
✅ Your order has been prioritized in our fulfillment queue
✅ Expedited shipping has been applied at no extra cost
✅ You'll receive tracking information within 2 hours
✅ Estimated delivery: October 12-13, 2024

Compensation:
As an apology for this inconvenience, I've applied a 20% refund ($37.99) to your original payment method, which you should see within 3-5 business days.

If you still prefer to cancel the order, I can process that immediately with a full refund. Just let me know your preference.

Best regards,
Alex Johnson
Senior Customer Success Specialist`,
            attachments: [
              {
                name: "Order_Tracking_Details.pdf",
                size: "145 KB",
                type: "application/pdf",
              },
            ],
            via: "Web",
            isPublic: true,
          },
        ],
      },
      {
        id: "109238",
        subject: "Product Return Request - Defective Item",
        type: "Problem",
        status: "Pending",
        priority: "Normal",
        channel: "Chat",
        created: "Oct 15, 2024 2:30 PM",
        updated: "Oct 25, 2024 9:15 AM",
        requester: {
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1 (555) 987-6543",
          company: "Smith Enterprises",
          avatar: "JS",
          timezone: "EST",
          language: "English",
          tags: ["Regular Customer"],
        },
        assignee: {
          name: "Sarah Chen",
          email: "sarah.chen@company.com",
          avatar: "SC",
          role: "Support Specialist",
        },
        organization: "Smith Enterprises",
        group: "Returns Team",
        tags: ["return", "defective", "quality-issue"],
        followers: ["Alex Johnson"],
        replies: [
          {
            id: "msg1",
            type: "customer",
            author: "John Smith",
            email: "john.smith@email.com",
            timestamp: "Oct 15, 2024 2:30 PM",
            content: `Hello,

I received my order yesterday (Order #ORD-88234) but unfortunately the item is defective. The product won't power on despite following all the instructions.

I would like to initiate a return and get a replacement or refund.

Please advise on the next steps.

Thanks,
John`,
            attachments: [
              {
                name: "defective_product.jpg",
                size: "2.3 MB",
                type: "image/jpeg",
              },
            ],
            via: "Chat",
            isPublic: true,
          },
          {
            id: "msg2",
            type: "agent",
            author: "Sarah Chen",
            email: "sarah.chen@company.com",
            timestamp: "Oct 15, 2024 3:15 PM",
            content: `Hi John,

I'm sorry to hear about the defective product. I've reviewed your order and I'm happy to help you with the return process.

I've initiated a return label that will be sent to your email within the next hour. Once you receive it:
1. Pack the item securely in its original packaging
2. Attach the return label
3. Drop it off at any shipping location

We'll process your refund within 3-5 business days after receiving the item.

Would you prefer a refund or a replacement?

Best regards,
Sarah Chen`,
            attachments: [],
            via: "Web",
            isPublic: true,
          },
        ],
      },
      {
        id: "109239",
        subject: "Account Access Issue",
        type: "Incident",
        status: "Solved",
        priority: "Urgent",
        channel: "Phone",
        created: "Oct 20, 2024 8:00 AM",
        updated: "Oct 20, 2024 10:30 AM",
        requester: {
          name: "Emily Davis",
          email: "emily.davis@corporate.com",
          phone: "+1 (555) 234-5678",
          company: "Corporate LLC",
          avatar: "ED",
          timezone: "CST",
          language: "English",
          tags: ["Enterprise", "VIP"],
        },
        assignee: {
          name: "Mike Ross",
          email: "mike.ross@company.com",
          avatar: "MR",
          role: "Technical Support Lead",
        },
        organization: "Corporate LLC",
        group: "Technical Support",
        tags: ["access-issue", "security", "urgent"],
        followers: [],
        replies: [
          {
            id: "msg1",
            type: "customer",
            author: "Emily Davis",
            email: "emily.davis@corporate.com",
            timestamp: "Oct 20, 2024 8:00 AM",
            content: `URGENT: I cannot access my account. Getting "Invalid credentials" error despite using the correct password. I need access ASAP for an important presentation.`,
            attachments: [],
            via: "Phone",
            isPublic: true,
          },
          {
            id: "msg2",
            type: "agent",
            author: "Mike Ross",
            email: "mike.ross@company.com",
            timestamp: "Oct 20, 2024 8:15 AM",
            content: `Hi Emily,

I've identified the issue - there was a temporary lock on your account due to multiple failed login attempts. I've unlocked your account and reset your session.

Please try logging in again. If you still face issues, I'm available on direct line: ext. 4567.

Best,
Mike Ross`,
            attachments: [],
            via: "Web",
            isPublic: true,
          },
          {
            id: "msg3",
            type: "customer",
            author: "Emily Davis",
            email: "emily.davis@corporate.com",
            timestamp: "Oct 20, 2024 10:30 AM",
            content: `Perfect! I'm able to log in now. Thank you for the quick response!`,
            attachments: [],
            via: "Email",
            isPublic: true,
          },
        ],
      },
    ]
  : [];

const EMOJI_CATEGORIES = {
  recent: ["😀", "👍", "❤️", "😢", "😮", "😡", "👏", "🎉"],
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
  ],
  people: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
  ],
  objects: [
    "📱",
    "💻",
    "🖥️",
    "⌨️",
    "🖱️",
    "🖨️",
    "📷",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤲",
    "👐",
    "🙌",
    "👏",
  ],
};

// Helper function to normalize attachments
const normalizeAttachments = (attachments) => {
  if (!attachments) return [];
  if (Array.isArray(attachments)) return attachments;
  if (typeof attachments === "string") {
    try {
      const parsed = JSON.parse(attachments);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }
  return [attachments];
};

// Helper function to normalize reply data from server
const normalizeReply = (reply) => {
  if (!reply) return null;

  return {
    id: reply.id || reply.message_id || `reply-${Date.now()}`,
    author:
      reply.author || reply.author_name || reply.user_name || "Unknown Author",
    email: reply.email || reply.author_email || reply.user_email,
    content: reply.content || reply.message || "",
    timestamp:
      reply.timestamp ||
      reply.created_at ||
      reply.createdAt ||
      new Date().toISOString(),
    type: reply.type || (reply.is_staff_reply ? "agent" : "customer"),
    isPublic:
      reply.isPublic !== undefined
        ? reply.isPublic
        : reply.is_public !== undefined
        ? reply.is_public
        : true,
    attachments: normalizeAttachments(reply.attachments),
    via: reply.via || "Web",
  };
};

export default function TicketDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("id"); // Get ticket ID from URL params
  const { user } = useAuth(); // Get current authenticated user

  // Fetch current ticket details
  const {
    ticket: currentTicket,
    loading: ticketLoading,
    error: ticketError,
    updating,
    updateStatus,
    updatePriority,
    updateType,
    updateTags,
    assignAgent,
    sendReply,
    loadReplies,
  } = useTicketDetails(ticketId);

  // UI State
  const [replyText, setReplyText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCCBCC, setShowCCBCC] = useState(false);
  const [ccRecipients, setCcRecipients] = useState("");
  const [bccRecipients, setBccRecipients] = useState("");
  const [replyType, setReplyType] = useState("public");
  const [attachments, setAttachments] = useState([]);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("recent");
  const [newTag, setNewTag] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRequesterMenu, setShowRequesterMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);

  // Local state for optimistic updates
  const [localStatus, setLocalStatus] = useState("");
  const [localPriority, setLocalPriority] = useState("");
  const [localType, setLocalType] = useState("");
  const [localTags, setLocalTags] = useState([]);
  const [localReplies, setLocalReplies] = useState([]);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const richTextEditorRef = useRef(null);

  // Sync local state with fetched ticket
  useEffect(() => {
    if (currentTicket) {
      console.log("Processing ticket data:", currentTicket);

      // Parse JSON string fields
      let parsedTags = [];
      let parsedAttachments = [];
      let parsedMetadata = {};

      try {
        parsedTags =
          typeof currentTicket.tags === "string"
            ? JSON.parse(currentTicket.tags)
            : currentTicket.tags || [];
      } catch (e) {
        console.error("Error parsing tags:", e);
      }

      try {
        parsedAttachments =
          typeof currentTicket.attachments === "string"
            ? JSON.parse(currentTicket.attachments)
            : currentTicket.attachments || [];
      } catch (e) {
        console.error("Error parsing attachments:", e);
      }

      try {
        parsedMetadata =
          typeof currentTicket.metadata === "string"
            ? JSON.parse(currentTicket.metadata)
            : currentTicket.metadata || {};
      } catch (e) {
        console.error("Error parsing metadata:", e);
      }

      // Add parsed fields to currentTicket
      currentTicket.parsedTags = parsedTags;
      currentTicket.parsedAttachments = parsedAttachments;
      currentTicket.parsedMetadata = parsedMetadata;

      // Map created_at/updated_at for backward compatibility
      currentTicket.created_at = currentTicket.createdAt;
      currentTicket.updated_at = currentTicket.updatedAt;

      console.log("Processed ticket:", {
        tags: parsedTags,
        attachments: parsedAttachments,
        metadata: parsedMetadata,
      });

      setLocalStatus(currentTicket.status || "open");
      setLocalPriority(currentTicket.priority || "medium");
      setLocalType(currentTicket.issue_type || "general_inquiry");
      setLocalTags(parsedTags);

      // Load replies from server if ticket has replies, otherwise use empty array
      if (currentTicket.replies && Array.isArray(currentTicket.replies)) {
        console.log("Using ticket.replies:", currentTicket.replies);
        const normalizedReplies = currentTicket.replies
          .map(normalizeReply)
          .filter(Boolean);
        setLocalReplies(normalizedReplies);
      } else {
        // Load replies separately if not included in ticket data
        console.log(
          "Loading replies separately for ticket:",
          currentTicket.ticket_number || currentTicket.id
        );
        loadReplies().then((replies) => {
          console.log("Loaded replies:", replies);
          const normalizedReplies = (replies || [])
            .map(normalizeReply)
            .filter(Boolean);
          setLocalReplies(normalizedReplies);
        });
      }
    }
  }, [currentTicket, loadReplies]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [localReplies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      // Close dropdown menus when clicking outside
      if (!event.target.closest(".more-menu-container")) {
        setShowMoreMenu(false);
      }
      if (!event.target.closest(".requester-menu-container")) {
        setShowRequesterMenu(false);
      }
      if (!event.target.closest(".assignee-menu-container")) {
        setShowAssigneeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendReply = async () => {
    // Validate reply text (strip HTML tags and check if there's actual content)
    const textContent = replyText?.replace(/<[^>]*>/g, "").trim();
    if (!textContent || !currentTicket) return;

    // Check if any files are still uploading
    const hasUploadingFiles = attachments.some(att => att.uploading);
    if (hasUploadingFiles) {
      alert("Please wait for file uploads to complete before sending.");
      return;
    }

    // Get current user info from auth context
    const currentUser = {
      email: user?.email || currentTicket.assigned_to || "support@nfinity.com",
      name: user?.name || user?.full_name || "Support Agent",
    };

    // Filter attachments to only include those with URLs (fully uploaded)
    const uploadedAttachments = attachments.filter(att => att.url);

    // Prepare reply data for API
    const replyData = {
      message: replyText,
      author_email: currentUser.email,
      author_name: currentUser.name,
      is_staff_reply: true,
      is_public: replyType === "public",
      attachments: uploadedAttachments.map((att) => ({
        name: att.name,
        url: att.url,
        size: att.size,
        type: att.type,
      })),
    };

    // Optimistic update - add reply to UI immediately
    const optimisticReply = {
      id: `temp-${Date.now()}`,
      type: replyType === "public" ? "agent" : "internal",
      author: currentUser.name,
      email: currentUser.email,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      content: replyText,
      attachments: [...uploadedAttachments],
      via: "Web",
      isPublic: replyType === "public",
    };

    setLocalReplies([...localReplies, optimisticReply]);

    // Clear the editor using the ref
    if (richTextEditorRef.current?.clear) {
      richTextEditorRef.current.clear();
    }
    setReplyText("");
    setAttachments([]);
    setShowCCBCC(false);
    setCcRecipients("");
    setBccRecipients("");

    try {
      // Send reply via API
      const newReply = await sendReply(replyData);

      if (newReply) {
        console.log("Reply sent successfully:", newReply);
        // The hook will automatically refresh the ticket data and replies
      } else {
        // If API failed, remove optimistic reply and show error
        setLocalReplies((prev) =>
          prev.filter((reply) => reply.id !== optimisticReply.id)
        );
        console.error("Failed to send reply");
        // You might want to show a toast notification here
        alert("Failed to send reply. Please try again.");
      }
    } catch (error) {
      // Remove optimistic reply on error
      setLocalReplies((prev) =>
        prev.filter((reply) => reply.id !== optimisticReply.id)
      );
      console.error("Error sending reply:", error);
      alert("Failed to send reply. Please try again.");
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    console.log(`📎 Starting upload of ${files.length} file(s):`, files.map(f => f.name));
    
    try {
      // Show loading state
      const tempAttachments = files.map((file) => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        uploading: true,
      }));
      setAttachments([...attachments, ...tempAttachments]);

      // Upload files to Cloudinary via backend
      console.log('🔄 Calling API to upload files...');
      const response = await chatApi.uploadFiles(files);
      console.log('✅ API Response:', response);
      
      if (response.success && response.data) {
        // Replace temp attachments with uploaded ones
        const uploadedAttachments = response.data.uploadedFiles.map((file, index) => ({
          name: files[index].name,
          size: `${(files[index].size / 1024).toFixed(1)} KB`,
          type: files[index].type,
          url: file.url,
          uploading: false,
        }));
        
        setAttachments((prev) => 
          prev.filter(att => !att.uploading).concat(uploadedAttachments)
        );
        
        console.log("✅ Files uploaded successfully:", uploadedAttachments);
        alert(`Successfully uploaded ${uploadedAttachments.length} file(s)!`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      // Remove temp attachments on error
      setAttachments((prev) => prev.filter(att => !att.uploading));
      alert("Failed to upload files. Please try again.");
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    console.log(`🖼️ Starting upload of ${files.length} image(s):`, files.map(f => f.name));
    
    try {
      // Show loading state
      const tempAttachments = files.map((file) => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        uploading: true,
      }));
      setAttachments([...attachments, ...tempAttachments]);

      // Upload images to Cloudinary via backend
      console.log('🔄 Calling API to upload images...');
      const response = await chatApi.uploadImages(files);
      console.log('✅ API Response:', response);
      
      if (response.success && response.data) {
        // Replace temp attachments with uploaded ones
        const uploadedAttachments = response.data.uploadedImages.map((img, index) => ({
          name: files[index].name,
          size: `${(files[index].size / 1024).toFixed(1)} KB`,
          type: files[index].type,
          url: img.url,
          uploading: false,
        }));
        
        setAttachments((prev) => 
          prev.filter(att => !att.uploading).concat(uploadedAttachments)
        );
        
        console.log("✅ Images uploaded successfully:", uploadedAttachments);
        alert(`Successfully uploaded ${uploadedAttachments.length} image(s)!`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      // Remove temp attachments on error
      setAttachments((prev) => prev.filter(att => !att.uploading));
      alert("Failed to upload images. Please try again.");
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    // Insert emoji into rich text editor programmatically
    if (richTextEditorRef.current?.insertText) {
      richTextEditorRef.current.insertText(emoji);
    } else {
      // Fallback: append to HTML content
      setReplyText((prev) =>
        (prev || "<p></p>").replace("</p>", emoji + "</p>")
      );
    }
    setShowEmojiPicker(false);
  };

  const addTag = async () => {
    const trimmedTag = newTag.trim().toLowerCase();
    
    // Validation
    if (!trimmedTag) return;
    
    if (localTags.includes(trimmedTag)) {
      alert("This tag already exists!");
      setNewTag("");
      return;
    }
    
    if (trimmedTag.length > 50) {
      alert("Tag is too long. Maximum 50 characters.");
      return;
    }
    
    const updatedTags = [...localTags, trimmedTag];
    const previousTags = [...localTags];
    
    // Optimistic update
    setLocalTags(updatedTags);
    setNewTag("");
    
    try {
      const success = await updateTags(updatedTags);
      if (success) {
        console.log("✅ Tag added successfully:", trimmedTag);
      } else {
        // Revert on failure
        setLocalTags(previousTags);
        setNewTag(trimmedTag);
        console.error("❌ Failed to add tag");
        alert("Failed to add tag. Please try again.");
      }
    } catch (error) {
      // Revert on error
      setLocalTags(previousTags);
      setNewTag(trimmedTag);
      console.error("❌ Error adding tag:", error);
      alert("Failed to add tag. Please try again.");
    }
  };

  const removeTag = async (tagToRemove) => {
    const updatedTags = localTags.filter((t) => t !== tagToRemove);
    
    // Optimistic update
    const previousTags = [...localTags];
    setLocalTags(updatedTags);
    
    try {
      const success = await updateTags(updatedTags);
      if (success) {
        console.log("✅ Tag removed successfully");
      } else {
        // Revert on failure
        setLocalTags(previousTags);
        console.error("❌ Failed to remove tag");
        alert("Failed to remove tag. Please try again.");
      }
    } catch (error) {
      // Revert on error
      setLocalTags(previousTags);
      console.error("❌ Error removing tag:", error);
      alert("Failed to remove tag. Please try again.");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentTicket) return;

    const originalStatus = localStatus;
    setLocalStatus(newStatus);

    try {
      console.log(
        `Updating ticket ${currentTicket.ticket_number} from ${originalStatus} to ${newStatus}`
      );
      const success = await updateStatus(newStatus);

      if (success) {
        console.log("✅ Status updated successfully");
      } else {
        console.error("❌ Failed to update ticket status");
        setLocalStatus(originalStatus);
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      setLocalStatus(originalStatus);

      // Show user-friendly error message
      alert(
        `Failed to update ticket status: ${error.message || "Unknown error"}`
      );
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!currentTicket) return;

    const originalPriority = localPriority;
    setLocalPriority(newPriority);

    try {
      console.log(
        `Updating ticket ${currentTicket.ticket_number} priority from ${originalPriority} to ${newPriority}`
      );
      const success = await updatePriority(newPriority);

      if (success) {
        console.log("✅ Priority updated successfully");
      } else {
        console.error("❌ Failed to update ticket priority");
        setLocalPriority(originalPriority);
      }
    } catch (error) {
      console.error("❌ Error updating priority:", error);
      setLocalPriority(originalPriority);
      alert(
        `Failed to update ticket priority: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleTypeChange = async (newType) => {
    if (!currentTicket) return;

    const originalType = localType;
    setLocalType(newType);

    try {
      console.log(
        `Updating ticket ${currentTicket.ticket_number} type from ${originalType} to ${newType}`
      );
      const success = await updateType(newType);

      if (success) {
        console.log("✅ Type updated successfully");
      } else {
        console.error("❌ Failed to update ticket type");
        setLocalType(originalType);
      }
    } catch (error) {
      console.error("❌ Error updating type:", error);
      setLocalType(originalType);
      alert(
        `Failed to update ticket type: ${error.message || "Unknown error"}`
      );
    }
  };

  // Handle rich text editor change
  const handleRichTextChange = (html) => {
    setReplyText(html);
  };

  // Handle star/favorite toggle
  const handleStarToggle = () => {
    setIsStarred(!isStarred);
    // TODO: Implement API call to save starred status
    console.log(`Ticket ${isStarred ? "unstarred" : "starred"}`);
  };

  // Handle archive
  const handleArchive = async () => {
    if (!currentTicket) return;

    const confirmArchive = window.confirm(
      "Are you sure you want to archive this ticket?"
    );
    if (!confirmArchive) return;

    try {
      // Update status to closed
      const success = await updateStatus("closed");
      if (success) {
        console.log("✅ Ticket archived successfully");
        // Navigate back to tickets list
        setTimeout(() => navigate("/tickets"), 500);
      }
    } catch (error) {
      console.error("❌ Error archiving ticket:", error);
      alert("Failed to archive ticket");
    }
  };

  // Handle more options menu toggle
  const handleMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  return (
    <>
      {/* Loading State */}
      {ticketLoading && !currentTicket && (
        <div className="w-full h-[calc(100vh-58px)] bg-[#151a1e] flex items-center justify-center">
          <div className="text-center">
            <Loader2
              size={48}
              className="text-blue-500 animate-spin mx-auto mb-4"
            />
            <p className="text-gray-400">Loading ticket details...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {ticketError && !currentTicket && (
        <div className="w-full h-[calc(100vh-58px)] bg-[#151a1e] flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-200 mb-2">
              Error Loading Ticket
            </h2>
            <p className="text-gray-400 mb-4">{ticketError}</p>
            <button
              onClick={() => navigate("/tickets")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      )}

      {/* No Ticket Selected */}
      {!ticketId && (
        <div className="w-full h-[calc(100vh-58px)] bg-[#151a1e] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-200 mb-2">
              No Ticket Selected
            </h2>
            <p className="text-gray-400 mb-4">
              Please select a ticket to view details
            </p>
            <button
              onClick={() => navigate("/tickets")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Go to Tickets
            </button>
          </div>
        </div>
      )}

      {/* Main Ticket View */}
      {currentTicket && (
        <div className="w-full h-[calc(100vh-58px)] bg-[#151a1e] text-gray-100">
          <div className="flex h-[calc(100vh-58px)] overflow-hidden">
            {/* Main Content - Left Side */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1d2328] border-r border-[#293239]">
              {/* Top Header Bar - Zendesk Style */}
              <div className="px-4 py-2.5 bg-[#1a1f24] border-b border-[#293239] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Back to tickets"
                  >
                    <ArrowLeft size={18} className="text-gray-400" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">
                      {currentTicket?.ticket_number || "Loading..."}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        localStatus === "open"
                          ? "bg-red-900/30 text-red-300 border border-red-800"
                          : localStatus === "pending"
                          ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
                          : localStatus === "in_progress"
                          ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                          : localStatus === "resolved" || localStatus === "closed"
                          ? "bg-green-900/30 text-green-300 border border-green-800"
                          : "bg-gray-900/30 text-gray-300 border border-gray-800"
                      }`}
                    >
                      {localStatus.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative more-menu-container">
                  <button
                    onClick={handleStarToggle}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title={isStarred ? "Unstar ticket" : "Star ticket"}
                  >
                    <Star
                      size={16}
                      className={
                        isStarred
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <button
                    onClick={handleMoreMenuToggle}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="More options"
                  >
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>

                  {/* More Options Dropdown */}
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1d2328] border border-[#293239] rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => {
                          window.print();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors rounded-t-lg"
                      >
                        Print Ticket
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setShowMoreMenu(false);
                          alert("Link copied!");
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        Copy Link
                      </button>
                      <div className="border-t border-[#293239]"></div>
                      <button
                        onClick={() => {
                          handleArchive();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-b-lg"
                      >
                        Delete Ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Breadcrumb/Tabs */}
              <div className="px-6 py-2 bg-[#151a1e] border-b border-[#293239] flex items-center gap-3 text-xs">
                <button className="text-gray-400 hover:text-gray-300">
                  {currentTicket?.customer_name || "Unknown"}
                </button>
                <span className="text-gray-600">|</span>
                <button className="text-gray-400 hover:text-gray-300">
                  {currentTicket?.customer_email || "N/A"}
                </button>
                <span className="text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      localStatus === "open"
                        ? "bg-red-600 text-white"
                        : localStatus === "pending"
                        ? "bg-yellow-600 text-white"
                        : localStatus === "resolved" || localStatus === "closed"
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {localStatus.toUpperCase()}
                  </span>
                  <span className="text-gray-200">
                    {currentTicket?.ticket_number || "N/A"}
                  </span>
                </div>
              </div>

              {/* Email Header Info */}
              <div className="px-6 py-4 bg-[#1a1f24] border-b border-[#293239]">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-medium text-gray-100">
                    {currentTicket?.subject}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Via {currentTicket?.issue_type || "email"}</span>
                    <span>
                      {new Date(currentTicket?.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversation Thread */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-6 bg-[#151a1e]"
              >
                <div className="max-w-5xl space-y-4">
                  {/* Initial ticket description as first message */}
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium bg-[#4a5568]">
                          {currentTicket?.customer_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-sm text-gray-100">
                            {currentTicket?.customer_name || "Unknown Customer"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {currentTicket?.created_at
                              ? new Date(
                                  currentTicket.created_at
                                ).toLocaleString()
                              : "Unknown date"}
                          </span>
                        </div>
                        <div className="mb-2 text-xs text-gray-500">
                          <span className="font-medium">To:</span> Nfinity
                          Support
                        </div>
                        <div className="bg-[#1d2328] border border-[#293239] rounded p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {currentTicket?.description ||
                            "No description available"}
                          {currentTicket?.parsedAttachments &&
                            currentTicket.parsedAttachments.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-[#293239]">
                                <div className="flex items-center gap-2 mb-4">
                                  <Paperclip
                                    size={16}
                                    className="text-blue-400"
                                  />
                                  <h4 className="text-sm font-medium text-gray-300">
                                    Attachments (
                                    {currentTicket.parsedAttachments.length})
                                  </h4>
                                </div>
                                <div className="space-y-4">
                                  {currentTicket.parsedAttachments.map(
                                    (url, idx) => {
                                      const isImage =
                                        /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
                                          url
                                        );

                                      if (isImage) {
                                        const openImageModal = () => {
                                          // Create modal overlay
                                          const modal =
                                            document.createElement("div");
                                          modal.className =
                                            "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4";
                                          modal.style.backdropFilter =
                                            "blur(4px)";

                                          // Create image container
                                          const imageContainer =
                                            document.createElement("div");
                                          imageContainer.className =
                                            "relative max-w-7xl max-h-full";

                                          // Create the enlarged image
                                          const enlargedImg =
                                            document.createElement("img");
                                          enlargedImg.src = url;
                                          enlargedImg.className =
                                            "max-w-full max-h-full object-contain rounded-lg shadow-2xl";
                                          enlargedImg.alt = `Attachment ${
                                            idx + 1
                                          }`;

                                          // Create close button
                                          const closeBtn =
                                            document.createElement("button");
                                          closeBtn.innerHTML = "×";
                                          closeBtn.className =
                                            "absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/20 transition-colors";

                                          // Close modal function
                                          const closeModal = () =>
                                            document.body.removeChild(modal);

                                          // Event listeners
                                          closeBtn.onclick = closeModal;
                                          modal.onclick = (e) =>
                                            e.target === modal && closeModal();
                                          document.addEventListener(
                                            "keydown",
                                            function escClose(e) {
                                              if (e.key === "Escape") {
                                                closeModal();
                                                document.removeEventListener(
                                                  "keydown",
                                                  escClose
                                                );
                                              }
                                            }
                                          );

                                          // Assemble modal
                                          imageContainer.appendChild(
                                            enlargedImg
                                          );
                                          imageContainer.appendChild(closeBtn);
                                          modal.appendChild(imageContainer);
                                          document.body.appendChild(modal);
                                        };

                                        return (
                                          <div key={idx} className="space-y-2">
                                            {/* Simple Image Thumbnail */}
                                            <div
                                              className="group relative cursor-pointer"
                                              onClick={openImageModal}
                                            >
                                              <img
                                                src={url}
                                                alt={`Attachment ${idx + 1}`}
                                                className="max-w-sm max-h-64 object-cover rounded-lg border border-[#293239] hover:border-blue-500/60 transition-all duration-200 hover:opacity-90"
                                              />
                                              {/* Simple hover overlay */}
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="bg-black/50 rounded-full p-2">
                                                  <Eye
                                                    size={20}
                                                    className="text-white"
                                                  />
                                                </div>
                                              </div>
                                            </div>

                                            {/* Simple Info */}
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-gray-400">
                                                Attachment {idx + 1}
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const link =
                                                    document.createElement("a");
                                                  link.href = url;
                                                  link.download = `attachment-${
                                                    idx + 1
                                                  }`;
                                                  link.click();
                                                }}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                              >
                                                <Download size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between bg-[#151a1e] px-4 py-3 rounded border border-[#293239] hover:border-blue-500/40 cursor-pointer transition-colors"
                                            onClick={() =>
                                              window.open(url, "_blank")
                                            }
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                                <File
                                                  size={16}
                                                  className="text-blue-400"
                                                />
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-200">
                                                  Attachment {idx + 1}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                  File
                                                </p>
                                              </div>
                                            </div>
                                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                                              View
                                            </button>
                                          </div>
                                        );
                                      }
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional replies */}
                  {localReplies
                    .filter((reply) => reply && (reply.id || reply.message_id))
                    .map((reply) => (
                      <div key={reply.id} className="mb-6">
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                reply.type === "customer"
                                  ? "bg-[#4a5568]"
                                  : reply.type === "agent"
                                  ? "bg-blue-600"
                                  : "bg-yellow-600"
                              }`}
                            >
                              {reply.author
                                ?.split(" ")
                                ?.map((n) => n[0])
                                ?.join("") || "?"}
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-sm text-gray-100">
                                {reply.author ||
                                  reply.author_name ||
                                  "Unknown Author"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {reply.timestamp ||
                                  reply.created_at ||
                                  "Unknown time"}
                              </span>
                              {reply.type === "internal" && (
                                <span className="px-1.5 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded flex items-center gap-1">
                                  <Eye size={11} />
                                </span>
                              )}
                            </div>

                            {/* Email To */}
                            <div className="mb-2 text-xs text-gray-500">
                              <span className="font-medium">To:</span>{" "}
                              {reply.type === "customer"
                                ? "Nfinity Support"
                                : currentTicket?.customer_name || "Customer"}
                              {reply.isPublic && (
                                <>
                                  <button className="ml-3 text-blue-400 hover:underline">
                                    Show more
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Message Body */}
                            <div className="bg-[#1d2328] border border-[#293239] rounded p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {reply.content || reply.message || "No content"}

                              {/* Attachments */}
                              {Array.isArray(reply.attachments) &&
                                reply.attachments.length > 0 && (
                                  <div className="mt-6 pt-4 border-t border-[#293239]">
                                    <div className="flex items-center gap-2 mb-4">
                                      <Paperclip
                                        size={16}
                                        className="text-blue-400"
                                      />
                                      <h4 className="text-sm font-medium text-gray-300">
                                        Attachments (
                                        {Array.isArray(reply.attachments)
                                          ? reply.attachments.length
                                          : 0}
                                        )
                                      </h4>
                                    </div>
                                    <div className="space-y-4">
                                      {(Array.isArray(reply.attachments)
                                        ? reply.attachments
                                        : []
                                      ).map((attachment, idx) => {
                                        const attachmentUrl =
                                          typeof attachment === "string"
                                            ? attachment
                                            : attachment.url ||
                                              attachment.file ||
                                              attachment;
                                        const attachmentName =
                                          attachment.name ||
                                          `Attachment ${idx + 1}`;

                                        const isImage =
                                          attachment.type?.startsWith(
                                            "image/"
                                          ) ||
                                          /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
                                            attachmentName || attachmentUrl
                                          );

                                        // Handle images (both local files and uploaded URLs)
                                        if (isImage && (attachment.file || attachmentUrl)) {
                                          const imageUrl = attachment.file 
                                            ? URL.createObjectURL(attachment.file)
                                            : attachmentUrl;

                                          const openImageModal = () => {
                                            // Create modal overlay
                                            const modal =
                                              document.createElement("div");
                                            modal.className =
                                              "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4";
                                            modal.style.backdropFilter =
                                              "blur(4px)";

                                            // Create image container
                                            const imageContainer =
                                              document.createElement("div");
                                            imageContainer.className =
                                              "relative max-w-7xl max-h-full";

                                            // Create the enlarged image
                                            const enlargedImg =
                                              document.createElement("img");
                                            enlargedImg.src = imageUrl;
                                            enlargedImg.className =
                                              "max-w-full max-h-full object-contain rounded-lg shadow-2xl";
                                            enlargedImg.alt = attachment.name;

                                            // Create close button
                                            const closeBtn =
                                              document.createElement("button");
                                            closeBtn.innerHTML = "×";
                                            closeBtn.className =
                                              "absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/20 transition-colors";

                                            // Close modal function
                                            const closeModal = () =>
                                              document.body.removeChild(modal);

                                            // Event listeners
                                            closeBtn.onclick = closeModal;
                                            modal.onclick = (e) =>
                                              e.target === modal &&
                                              closeModal();
                                            document.addEventListener(
                                              "keydown",
                                              function escClose(e) {
                                                if (e.key === "Escape") {
                                                  closeModal();
                                                  document.removeEventListener(
                                                    "keydown",
                                                    escClose
                                                  );
                                                }
                                              }
                                            );

                                            // Assemble modal
                                            imageContainer.appendChild(
                                              enlargedImg
                                            );
                                            imageContainer.appendChild(
                                              closeBtn
                                            );
                                            modal.appendChild(imageContainer);
                                            document.body.appendChild(modal);
                                          };

                                          return (
                                            <div
                                              key={idx}
                                              className="space-y-2"
                                            >
                                              {/* Simple Image Thumbnail */}
                                              <div
                                                className="group relative cursor-pointer"
                                                onClick={openImageModal}
                                              >
                                                <img
                                                  src={imageUrl}
                                                  alt={attachment.name}
                                                  className="max-w-sm max-h-64 object-cover rounded-lg border border-[#293239] hover:border-blue-500/60 transition-all duration-200 hover:opacity-90"
                                                />
                                                {/* Simple hover overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                  <div className="bg-black/50 rounded-full p-2">
                                                    <Eye
                                                      size={20}
                                                      className="text-white"
                                                    />
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Simple Info */}
                                              <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400 truncate">
                                                  {attachment.name}
                                                </span>
                                                <button
                                                  onClick={() => {
                                                    const link =
                                                      document.createElement(
                                                        "a"
                                                      );
                                                    link.href = imageUrl;
                                                    link.download =
                                                      attachment.name;
                                                    link.click();
                                                  }}
                                                  className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                                                >
                                                  <Download size={16} />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        } else if (
                                          isImage &&
                                          typeof attachment === "string"
                                        ) {
                                          const openImageModal = () => {
                                            // Create modal overlay
                                            const modal =
                                              document.createElement("div");
                                            modal.className =
                                              "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4";
                                            modal.style.backdropFilter =
                                              "blur(4px)";

                                            // Create image container
                                            const imageContainer =
                                              document.createElement("div");
                                            imageContainer.className =
                                              "relative max-w-7xl max-h-full";

                                            // Create the enlarged image
                                            const enlargedImg =
                                              document.createElement("img");
                                            enlargedImg.src = attachment;
                                            enlargedImg.className =
                                              "max-w-full max-h-full object-contain rounded-lg shadow-2xl";
                                            enlargedImg.alt = `Attachment ${
                                              idx + 1
                                            }`;

                                            // Create close button
                                            const closeBtn =
                                              document.createElement("button");
                                            closeBtn.innerHTML = "×";
                                            closeBtn.className =
                                              "absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/20 transition-colors";

                                            // Close modal function
                                            const closeModal = () =>
                                              document.body.removeChild(modal);

                                            // Event listeners
                                            closeBtn.onclick = closeModal;
                                            modal.onclick = (e) =>
                                              e.target === modal &&
                                              closeModal();
                                            document.addEventListener(
                                              "keydown",
                                              function escClose(e) {
                                                if (e.key === "Escape") {
                                                  closeModal();
                                                  document.removeEventListener(
                                                    "keydown",
                                                    escClose
                                                  );
                                                }
                                              }
                                            );

                                            // Assemble modal
                                            imageContainer.appendChild(
                                              enlargedImg
                                            );
                                            imageContainer.appendChild(
                                              closeBtn
                                            );
                                            modal.appendChild(imageContainer);
                                            document.body.appendChild(modal);
                                          };

                                          return (
                                            <div
                                              key={idx}
                                              className="space-y-2"
                                            >
                                              {/* Simple Image Thumbnail */}
                                              <div
                                                className="group relative cursor-pointer"
                                                onClick={openImageModal}
                                              >
                                                <img
                                                  src={attachment}
                                                  alt={`Attachment ${idx + 1}`}
                                                  className="max-w-sm max-h-64 object-cover rounded-lg border border-[#293239] hover:border-blue-500/60 transition-all duration-200 hover:opacity-90"
                                                />
                                                {/* Simple hover overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                  <div className="bg-black/50 rounded-full p-2">
                                                    <Eye
                                                      size={20}
                                                      className="text-white"
                                                    />
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Simple Info */}
                                              <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">
                                                  Attachment {idx + 1}
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    window.open(
                                                      attachment,
                                                      "_blank"
                                                    )
                                                  }
                                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                  <Download size={16} />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        } else {
                                          // Non-image file attachment (PDF, video, document, etc.)
                                          const attachmentUrl =
                                            typeof attachment === "string"
                                              ? attachment
                                              : attachment.url || attachment;

                                          return (
                                            <div
                                              key={idx}
                                              className="flex items-center justify-between bg-[#151a1e] px-4 py-3 rounded border border-[#293239] hover:border-blue-500/40 transition-colors"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                                  <File
                                                    size={16}
                                                    className="text-blue-400"
                                                  />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-medium text-gray-200 truncate">
                                                    {attachment.name ||
                                                      `Attachment ${idx + 1}`}
                                                  </p>
                                                  {attachment.size && (
                                                    <p className="text-xs text-gray-500">
                                                      {attachment.size}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  window.open(
                                                    attachmentUrl,
                                                    "_blank"
                                                  )
                                                }
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                              >
                                                View
                                              </button>
                                            </div>
                                          );
                                        }
                                      })}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Email Composer */}
              <div className="border-t border-[#293239] bg-[#1a1f24]">
                {/* Composer Header */}
                <div className="px-6 py-2.5 border-b border-[#293239] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Reply Type Dropdown */}
                    <button
                      onClick={() =>
                        setReplyType(
                          replyType === "public" ? "internal" : "public"
                        )
                      }
                      className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                        replyType === "public"
                          ? "bg-transparent border-gray-600 text-gray-300 hover:bg-white/5"
                          : "bg-yellow-600/20 text-yellow-300 border-yellow-600/40"
                      }`}
                    >
                      {replyType === "public"
                        ? "Public reply"
                        : "Internal note"}
                      <ChevronDown size={12} />
                    </button>

                    {/* Recipient */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">To</span>
                      <button className="flex items-center gap-1.5 px-2 py-1 bg-[#151a1e] border border-[#293239] rounded hover:border-gray-600 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-[#4a5568] flex items-center justify-center text-white text-xs font-medium">
                          {currentTicket?.customer_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </div>
                        <span className="text-gray-300">
                          {currentTicket?.customer_name || "Customer"}
                        </span>
                        <X size={12} className="text-gray-500" />
                      </button>
                    </div>

                    {/* CC Button */}
                    <button
                      onClick={() => setShowCCBCC(!showCCBCC)}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 hover:bg-blue-500/10 rounded transition-colors"
                    >
                      CC
                    </button>
                  </div>
                </div>

                {/* CC/BCC Fields */}
                {showCCBCC && (
                  <div className="px-6 py-2 border-b border-[#293239] space-y-2 bg-[#151a1e]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-8">Cc</span>
                      <input
                        type="text"
                        value={ccRecipients}
                        onChange={(e) => setCcRecipients(e.target.value)}
                        placeholder="Add Cc recipients..."
                        className="flex-1 px-3 py-1.5 text-xs bg-[#1d2328] border border-[#293239] rounded text-gray-200 placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-8">Bcc</span>
                      <input
                        type="text"
                        value={bccRecipients}
                        onChange={(e) => setBccRecipients(e.target.value)}
                        placeholder="Add Bcc recipients..."
                        className="flex-1 px-3 py-1.5 text-xs bg-[#1d2328] border border-[#293239] rounded text-gray-200 placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Enterprise Rich Text Editor */}
                <div className="px-6 py-3">
                  <SimpleTextEditor
                    ref={richTextEditorRef}
                    value={replyText}
                    onChange={handleRichTextChange}
                    placeholder="Type your message here... Use formatting options to style your text."
                    className="w-full"
                  />

                  {/* Additional Toolbar for Attachments & Emojis */}
                  <div className="mt-2 flex items-center gap-2 pt-2 border-t border-[#293239]/50">
                    {/* File Attachment */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        console.log('📎 Attach files button clicked');
                        console.log('fileInputRef:', fileInputRef.current);
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#1d2328] hover:bg-[#252c31] border border-[#293239] rounded transition-colors text-gray-300"
                      title="Attach files"
                    >
                      <Paperclip size={14} />
                      <span>Attach files</span>
                    </button>

                    {/* Image Upload */}
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        console.log('🖼️ Insert image button clicked');
                        console.log('imageInputRef:', imageInputRef.current);
                        imageInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#1d2328] hover:bg-[#252c31] border border-[#293239] rounded transition-colors text-gray-300"
                      title="Insert image"
                    >
                      <Image size={14} />
                      <span>Insert image</span>
                    </button>

                    {/* Emoji Picker */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#1d2328] hover:bg-[#252c31] border border-[#293239] rounded transition-colors text-gray-300"
                        title="Insert emoji"
                      >
                        <Smile size={14} />
                        <span>Emoji</span>
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#1d2328] border border-[#293239] rounded-lg shadow-xl z-30 overflow-hidden">
                          {/* Emoji Categories */}
                          <div className="flex items-center gap-1 p-2 border-b border-[#293239] bg-[#151a1e]">
                            {Object.keys(EMOJI_CATEGORIES).map((category) => (
                              <button
                                key={category}
                                onClick={() =>
                                  setSelectedEmojiCategory(category)
                                }
                                className={`px-2 py-1 text-xs rounded transition-colors capitalize ${
                                  selectedEmojiCategory === category
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:bg-white/5"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                          {/* Emoji Grid */}
                          <div className="p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {EMOJI_CATEGORIES[selectedEmojiCategory].map(
                              (emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => insertEmoji(emoji)}
                                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/5 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 bg-[#1d2328] px-2.5 py-1.5 rounded border border-[#293239] group ${
                            attachment.uploading ? 'opacity-60' : ''
                          }`}
                        >
                          {attachment.uploading ? (
                            <Loader2 size={14} className="text-blue-400 animate-spin" />
                          ) : (
                            <File size={14} className="text-blue-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-300 truncate">
                              {attachment.name}
                              {attachment.uploading && (
                                <span className="ml-1.5 text-gray-500">(uploading...)</span>
                              )}
                            </p>
                            {attachment.size && !attachment.uploading && (
                              <p className="text-[10px] text-gray-500">{attachment.size}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            disabled={attachment.uploading}
                            className="p-0.5 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                          >
                            <X size={12} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Composer Footer - Simple Submit */}
                <div className="px-6 py-2.5 border-t border-[#293239] flex items-center justify-end bg-[#151a1e]">
                  <button
                    onClick={handleSendReply}
                    disabled={
                      !replyText ||
                      replyText === "<p></p>" ||
                      replyText === "<p><br></p>" ||
                      !replyText.replace(/<[^>]*>/g, "").trim() ||
                      attachments.some(att => att.uploading)
                    }
                    className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors flex items-center gap-2"
                  >
                    {attachments.some(att => att.uploading) && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Submit as {localStatus}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-64 bg-[#1a1f24] border-l border-[#293239] overflow-y-auto flex-shrink-0">
              {/* Status */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Status
                </h4>
                <select
                  value={localStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="w-full px-2 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-xs text-gray-300 hover:bg-[#1d2328] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#1d2328] [&>option]:text-gray-300 [&>option]:py-1"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="open" className="bg-[#1d2328] text-gray-300">
                    Open
                  </option>
                  <option
                    value="pending"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Pending
                  </option>
                  <option
                    value="in_progress"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    In Progress
                  </option>
                  <option
                    value="resolved"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Resolved
                  </option>
                  <option value="closed" className="bg-[#1d2328] text-gray-300">
                    Closed
                  </option>
                </select>
                {updating && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                    <Loader2 size={12} className="animate-spin" />
                    Updating status...
                  </div>
                )}
              </div>
              {/* Requester */}
              <div className="p-4 border-b border-[#293239] relative requester-menu-container">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Requester
                </h4>
                <button
                  onClick={() => setShowRequesterMenu(!showRequesterMenu)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-[#4a5568] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {currentTicket?.customer_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">
                      {currentTicket?.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentTicket?.customer_email}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {showRequesterMenu && (
                  <div className="absolute left-4 right-4 top-full mt-1 bg-[#1d2328] border border-[#293239] rounded-lg shadow-xl z-50 p-3">
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="text-gray-200">
                          {currentTicket?.customer_email}
                        </p>
                      </div>
                      {currentTicket?.customer_phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="text-gray-200">
                            {currentTicket?.customer_phone}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            currentTicket?.customer_email || ""
                          );
                          setShowRequesterMenu(false);
                          alert("Email copied!");
                        }}
                        className="w-full mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                      >
                        Copy Email
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div className="p-4 border-b border-[#293239] relative assignee-menu-container">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Assignee
                </h4>
                <button
                  onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 bg-purple-600">
                    {currentTicket?.assigned_to
                      ?.split("@")[0]
                      ?.substring(0, 2)
                      .toUpperCase() || "SA"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">
                      {currentTicket?.assigned_to || "Unassigned"}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {showAssigneeMenu && (
                  <div className="absolute left-4 right-4 top-full mt-1 bg-[#1d2328] border border-[#293239] rounded-lg shadow-xl z-50 p-2">
                    <div className="text-xs space-y-1">
                      <button
                        onClick={async () => {
                          if (user?.email) {
                            await assignAgent(user.email);
                            setShowAssigneeMenu(false);
                          }
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-white/5 rounded transition-colors text-gray-200"
                      >
                        Assign to me
                      </button>
                      <button
                        onClick={async () => {
                          await assignAgent(null);
                          setShowAssigneeMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-white/5 rounded transition-colors text-gray-400"
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
                  {localTags.length > 0 ? (
                    localTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-[#2563eb]/20 px-2 py-0.5 rounded text-xs text-blue-300 border border-blue-500/30 transition-all duration-200 hover:bg-[#2563eb]/30"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          disabled={updating}
                          className="hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove tag"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">No tags yet</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !updating) {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={updating}
                    placeholder="Add tag..."
                    className="flex-1 px-2 py-1 text-xs bg-[#151a1e] border border-[#293239] rounded text-gray-200 placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    onClick={addTag}
                    disabled={updating || !newTag.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                  >
                    {updating ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              </div>

              {/* Type */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Type
                </h4>
                <select
                  value={localType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  disabled={updating}
                  className="w-full px-2 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-xs text-gray-300 hover:bg-[#1d2328] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#1d2328] [&>option]:text-gray-300 [&>option]:py-1"
                  style={{ colorScheme: "dark" }}
                >
                  <option
                    value="general_inquiry"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    General Inquiry
                  </option>
                  <option
                    value="order_issue"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Order Issue
                  </option>
                  <option
                    value="wrong_item"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Wrong Item
                  </option>
                  <option
                    value="wrong_address"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Wrong Address
                  </option>
                  <option
                    value="defect_quality"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Defect/Quality Issue
                  </option>
                  <option
                    value="shipping_delay"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Shipping Delay
                  </option>
                  <option
                    value="missing_item"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Missing Item
                  </option>
                  <option
                    value="agent_request"
                    className="bg-[#1d2328] text-gray-300"
                  >
                    Agent Request
                  </option>
                  <option value="other" className="bg-[#1d2328] text-gray-300">
                    Other
                  </option>
                </select>
              </div>

              {/* Priority */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Priority
                </h4>
                <select
                  value={localPriority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={updating}
                  className="w-full px-2 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-xs text-gray-300 hover:bg-[#1d2328] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 outline-none disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#1d2328] [&>option]:text-gray-300 [&>option]:py-1"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="low" className="bg-[#1d2328] text-gray-300">
                    Low
                  </option>
                  <option value="medium" className="bg-[#1d2328] text-gray-300">
                    Medium
                  </option>
                  <option value="high" className="bg-[#1d2328] text-gray-300">
                    High
                  </option>
                  <option value="urgent" className="bg-[#1d2328] text-gray-300">
                    Urgent
                  </option>
                </select>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
