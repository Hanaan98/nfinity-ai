import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTicketDetails } from "../hooks/useTicketDetails";
import { useTickets } from "../hooks/useTickets";
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
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

const DEMO_TICKETS = [
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
];

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

export default function TicketDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("id"); // Get ticket ID from URL params

  // Fetch all tickets for the dropdown
  const { tickets: allTickets } = useTickets({ limit: 100 });

  // Fetch current ticket details
  const {
    ticket: currentTicket,
    loading: ticketLoading,
    error: ticketError,
    updating,
    updateStatus: updateTicketStatus,
    assignAgent,
    refresh: refreshTicket,
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
  const [isFollowing, setIsFollowing] = useState(false);

  // Local state for optimistic updates
  const [localStatus, setLocalStatus] = useState("");
  const [localPriority, setLocalPriority] = useState("");
  const [localType, setLocalType] = useState("");
  const [localTags, setLocalTags] = useState([]);
  const [localReplies, setLocalReplies] = useState([]);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);

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
      setLocalReplies(currentTicket.replies || []);
    }
  }, [currentTicket]);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendReply = () => {
    if (!replyText.trim() || !currentTicket) return;

    const newReply = {
      id: `msg${localReplies.length + 1}`,
      type: replyType === "public" ? "agent" : "internal",
      author: currentTicket.assigned_to || "Support Agent",
      email: currentTicket.assigned_to || "support@nfinity.com",
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      content: replyText,
      attachments: [...attachments],
      via: "Web",
      isPublic: replyType === "public",
    };

    setLocalReplies([...localReplies, newReply]);
    setReplyText("");
    setAttachments([]);
    setShowCCBCC(false);
    setCcRecipients("");
    setBccRecipients("");

    // TODO: Implement API call to save reply
    console.log("Reply sent:", newReply);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
      file: file,
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    setReplyText(replyText + emoji);
    setShowEmojiPicker(false);
  };

  const addTag = () => {
    if (newTag.trim() && !localTags.includes(newTag.trim().toLowerCase())) {
      setLocalTags([...localTags, newTag.trim().toLowerCase()]);
      setNewTag("");
      // TODO: Implement API call to save tags
    }
  };

  const removeTag = (tagToRemove) => {
    setLocalTags(localTags.filter((t) => t !== tagToRemove));
    // TODO: Implement API call to remove tag
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement API call to follow/unfollow ticket
  };

  const switchTicket = (ticketNumber) => {
    // Navigate to the selected ticket
    navigate(`/tickets/details?id=${encodeURIComponent(ticketNumber)}`);
  };

  const handleStatusChange = async (newStatus) => {
    setLocalStatus(newStatus);
    const success = await updateTicketStatus(newStatus);
    if (!success) {
      // Revert on error
      setLocalStatus(currentTicket?.status || "open");
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setLocalPriority(newPriority);
    // TODO: Implement API call to update priority
    console.log("Priority changed to:", newPriority);
  };

  const handleTypeChange = async (newType) => {
    setLocalType(newType);
    // TODO: Implement API call to update type
    console.log("Type changed to:", newType);
  };

  const handleAssignAgent = async (agentEmail) => {
    const success = await assignAgent(agentEmail);
    if (success) {
      refreshTicket();
    }
  };

  // Text formatting functions for textarea
  const insertTextAtCursor = (before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyText.substring(start, end);
    const newText =
      replyText.substring(0, start) +
      before +
      selectedText +
      after +
      replyText.substring(end);

    setReplyText(newText);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const formatBold = () => insertTextAtCursor("**", "**");
  const formatItalic = () => insertTextAtCursor("*", "*");
  const formatUnderline = () => insertTextAtCursor("<u>", "</u>");
  const formatCode = () => insertTextAtCursor("`", "`");
  const formatLink = () => {
    const url = prompt("Enter URL:");
    if (url) insertTextAtCursor("[", `](${url})`);
  };
  const insertBulletList = () => insertTextAtCursor("\n• ");
  const insertNumberedList = () => insertTextAtCursor("\n1. ");
  const alignLeft = () => insertTextAtCursor("");
  const alignCenter = () => insertTextAtCursor("");
  const alignRight = () => insertTextAtCursor("");

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
              {/* Top Header Bar */}
              <div className="px-6 py-3 bg-[#1a1f24] border-b border-[#293239] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/5 rounded transition-colors"
                  >
                    <ArrowLeft size={18} className="text-gray-400" />
                  </button>
                  <div className="flex items-center gap-3">
                    <select
                      value={currentTicket?.ticket_number || ""}
                      onChange={(e) => switchTicket(e.target.value)}
                      className="px-3 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer focus:ring-1 focus:ring-blue-500/40 outline-none"
                    >
                      {allTickets.map((t) => (
                        <option key={t.id} value={t.ticket_number}>
                          {t.ticket_number} - {t.subject.substring(0, 40)}...
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded transition-colors">
                    <Star size={18} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded transition-colors">
                    <Archive size={18} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded transition-colors">
                    <MoreHorizontal size={18} className="text-gray-400" />
                  </button>
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
                    {currentTicket?.ticket_number}
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
                            {currentTicket?.customer_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              currentTicket?.created_at
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-2 text-xs text-gray-500">
                          <span className="font-medium">To:</span> Nfinity
                          Support
                        </div>
                        <div className="bg-[#1d2328] border border-[#293239] rounded p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {currentTicket?.description}
                          {currentTicket?.parsedAttachments &&
                            currentTicket.parsedAttachments.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[#293239] space-y-2">
                                {currentTicket.parsedAttachments.map(
                                  (url, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 bg-[#151a1e] px-3 py-2 rounded border border-[#293239] hover:border-blue-500/40 cursor-pointer transition-colors"
                                      onClick={() => window.open(url, "_blank")}
                                    >
                                      <Image
                                        size={15}
                                        className="text-blue-400"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-300 truncate">
                                          Attachment {idx + 1}
                                        </p>
                                      </div>
                                      <Download
                                        size={13}
                                        className="text-gray-400"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional replies */}
                  {localReplies.map((reply) => (
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
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-sm text-gray-100">
                              {reply.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {reply.timestamp}
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
                            {reply.content}

                            {/* Attachments */}
                            {reply.attachments &&
                              reply.attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#293239] space-y-2">
                                  {reply.attachments.map((attachment, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 bg-[#151a1e] px-3 py-2 rounded border border-[#293239] hover:border-blue-500/40 cursor-pointer transition-colors"
                                    >
                                      <File
                                        size={15}
                                        className="text-blue-400"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-300 truncate">
                                          {attachment.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {attachment.size}
                                        </p>
                                      </div>
                                      <Download
                                        size={13}
                                        className="text-gray-400"
                                      />
                                    </div>
                                  ))}
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

                {/* Rich Text Editor Toolbar */}
                <div className="px-6 py-2 border-b border-[#293239] flex items-center gap-1 bg-[#151a1e]">
                  {/* Text Formatting */}
                  <button
                    onClick={formatBold}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Bold"
                    type="button"
                  >
                    <Bold size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={formatItalic}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Italic"
                    type="button"
                  >
                    <Italic size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={formatUnderline}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Underline"
                    type="button"
                  >
                    <Underline size={14} className="text-gray-400" />
                  </button>

                  <div className="w-px h-5 bg-[#293239] mx-1"></div>

                  {/* Lists */}
                  <button
                    onClick={insertBulletList}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Bullet List"
                    type="button"
                  >
                    <List size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={insertNumberedList}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Numbered List"
                    type="button"
                  >
                    <ListOrdered size={14} className="text-gray-400" />
                  </button>

                  <div className="w-px h-5 bg-[#293239] mx-1"></div>

                  {/* Alignment */}
                  <button
                    onClick={alignLeft}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Align Left"
                    type="button"
                  >
                    <AlignLeft size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={alignCenter}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Align Center"
                    type="button"
                  >
                    <AlignCenter size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={alignRight}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Align Right"
                    type="button"
                  >
                    <AlignRight size={14} className="text-gray-400" />
                  </button>

                  <div className="w-px h-5 bg-[#293239] mx-1"></div>

                  {/* Insert Options */}
                  <button
                    onClick={formatLink}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Insert Link"
                    type="button"
                  >
                    <Link size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={formatCode}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Code Block"
                    type="button"
                  >
                    <Code size={14} className="text-gray-400" />
                  </button>

                  {/* File Attachment */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Attach files"
                  >
                    <Paperclip size={14} className="text-gray-400" />
                  </button>

                  {/* Image Upload */}
                  <button
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Insert image"
                  >
                    <Image size={14} className="text-gray-400" />
                  </button>

                  {/* Emoji Picker */}
                  <div className="relative" ref={emojiPickerRef}>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-white/5 rounded transition-colors"
                      title="Insert emoji"
                    >
                      <Smile size={14} className="text-gray-400" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#1d2328] border border-[#293239] rounded-lg shadow-xl z-30 overflow-hidden">
                        {/* Emoji Categories */}
                        <div className="flex items-center gap-1 p-2 border-b border-[#293239] bg-[#151a1e]">
                          {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedEmojiCategory(category)}
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

                {/* Text Area */}
                <div className="px-6 py-3">
                  <textarea
                    ref={textareaRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#151a1e] border border-[#293239] rounded text-sm text-gray-200 focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 outline-none min-h-[100px] max-h-[300px] overflow-y-auto resize-none"
                    placeholder="Type your message here..."
                  />

                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-[#1d2328] px-2.5 py-1.5 rounded border border-[#293239] group"
                        >
                          <File size={14} className="text-blue-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-300 truncate">
                              {attachment.name}
                            </p>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="p-0.5 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
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
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                  >
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
                  className="w-full px-2 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-xs text-gray-300 hover:bg-white/5 transition-colors cursor-pointer focus:ring-1 focus:ring-blue-500/40 outline-none"
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {/* Requester */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Requester
                </h4>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left">
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
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Assignee */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Assignee
                </h4>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left">
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
              </div>

              {/* Followers */}
              <div className="p-4 border-b border-[#293239]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Followers
                  </h4>
                  <button
                    onClick={toggleFollow}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    {isFollowing ? "unfollow" : "follow"}
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  <div className="px-2 py-1.5">-</div>
                </div>
              </div>

              {/* Sharing */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Sharing
                </h4>
                <button className="w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-xs text-gray-400 text-left flex items-center justify-between">
                  <span>-</span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Tags */}
              <div className="p-4 border-b border-[#293239]">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {localTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-[#2563eb]/20 px-2 py-0.5 rounded text-xs text-blue-300 border border-blue-500/30"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-2 py-1 text-xs bg-[#151a1e] border border-[#293239] rounded text-gray-200 placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/40 outline-none"
                  />
                  <button
                    onClick={addTag}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Add
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
                  className="w-full px-2 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-xs text-gray-300 hover:bg-white/5 transition-colors cursor-pointer focus:ring-1 focus:ring-blue-500/40 outline-none"
                >
                  <option value="general_inquiry">General Inquiry</option>
                  <option value="order_issue">Order Issue</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="wrong_address">Wrong Address</option>
                  <option value="defect_quality">Defect/Quality Issue</option>
                  <option value="shipping_delay">Shipping Delay</option>
                  <option value="missing_item">Missing Item</option>
                  <option value="agent_request">Agent Request</option>
                  <option value="other">Other</option>
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
                  className="w-full px-2 py-1.5 bg-[#151a1e] border border-[#293239] rounded text-xs text-gray-300 hover:bg-white/5 transition-colors cursor-pointer focus:ring-1 focus:ring-blue-500/40 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
