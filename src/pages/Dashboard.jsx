// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { chatApi } from "../services/api";
import { chatToActivity, formatTimeAgo } from "../utils/messageHelpers";
import AnimatedStatCard from "../components/AnimatedStatCard";
import AreaChart from "../components/charts/AreaChart";
import BarChart from "../components/charts/BarChart";
import InsightCard from "../components/InsightCard";
import CustomSelect from "../components/CustomSelect";

const cardBase =
  "bg-[#1d2328] border border-[#293239] rounded-lg transition-all duration-200 hover:border-[#3a434a]";

const StatCard = ({ label, value, sub, trend, isLoading = false }) => (
  <div className={`${cardBase} p-6 relative overflow-hidden group`}>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-2/3"></div>
      </div>
    ) : (
      <>
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-3xl font-bold text-white">{value}</div>
          {trend && (
            <div
              className={`text-sm font-medium ${
                trend.type === "up"
                  ? "text-green-400"
                  : trend.type === "down"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {trend.type === "up" ? "↗" : trend.type === "down" ? "↙" : "→"}{" "}
              {trend.value}
            </div>
          )}
        </div>
        {sub && <p className="mt-2 text-xs text-gray-500">{sub}</p>}
      </>
    )}
  </div>
);

const MiniStat = ({ title, subtitle, value, footnote, isLoading = false }) => (
  <div className={`${cardBase} p-5 relative overflow-hidden group`}>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-600 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-2/3"></div>
      </div>
    ) : (
      <>
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-100">{title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="mt-4 text-2xl font-bold text-blue-400">{value}</div>
        <p className="mt-1 text-xs text-gray-500">{footnote}</p>
      </>
    )}
  </div>
);

const RecentActivityItem = ({ activity, isLoading = false, onClick }) => {
  if (isLoading) {
    return (
      <li className="py-4 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-600"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-600 rounded w-1/3"></div>
              <div className="h-3 bg-gray-600 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="flex gap-2">
              <div className="h-5 bg-gray-600 rounded w-16"></div>
              <div className="h-5 bg-gray-600 rounded w-12"></div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "#10b981";
      case "active":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      case "escalated":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4, backgroundColor: "rgba(29, 35, 40, 0.5)" }}
      transition={{ duration: 0.2 }}
      className="py-4 -mx-4 px-4 rounded-lg cursor-pointer border border-transparent hover:border-[#293239]"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <motion.span
          className="mt-1.5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: getStatusColor(activity.status) }}
          animate={{
            scale: activity.status === 'active' ? [1, 1.3, 1] : 1,
            opacity: activity.status === 'active' ? [1, 0.5, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: activity.status === 'active' ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              <span className="font-medium text-gray-200">
                {activity.customerName}
              </span>
              {activity.sessionId && (
                <span className="text-gray-500 ml-2">
                  • #{activity.sessionId}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-400">{activity.timeAgo}</p>
          </div>
          <p className="text-sm text-gray-300 mt-1 line-clamp-2">
            {activity.messagePreview || activity.latestMessage}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#1d2328] px-2 py-1 text-xs text-gray-300 border border-[#293239]">
              {activity.type || "Chat"}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs border border-[#293239] ${
                activity.status === "active"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : activity.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : activity.status === "resolved"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-[#1d2328] text-gray-300"
              }`}
            >
              {activity.status}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
};

const Row = ({ children }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">{children}</div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("7"); // days
  const [lastUpdated, setLastUpdated] = useState(null);

  // Calculate date range
  const getDateRange = (days) => {
    // Get current date in local timezone at end of day
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // Calculate start date
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1)); // Subtract days-1 to include today
    startDate.setHours(0, 0, 0, 0);
    
    return { 
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0]
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(parseInt(dateRange));

      // Fetch dashboard overview using centralized API service
      const dashboard = await chatApi.getAnalyticsDashboard({
        startDate,
        endDate,
      });

      console.log("Dashboard API response:", dashboard);

      // Extract data from the API response structure
      const dashboardData = dashboard.success ? dashboard.data : dashboard;
      
      console.log("Extracted dashboardData:", dashboardData);
      console.log("AI Chats:", dashboardData.aiChats);
      console.log("Human Escalations:", dashboardData.humanEscalations);

      // Fetch customer statistics for the 4th KPI card
      try {
        const customers = await chatApi.getAnalyticsCustomers({
          startDate,
          endDate,
        });
        const customerData = customers.success ? customers.data : customers;
        dashboardData.customers = customerData;
      } catch (error) {
        console.error("Failed to fetch customer stats:", error);
        // Continue without customer stats
        dashboardData.customers = {
          totalCustomers: 0,
          newCustomers: 0,
          activeCustomers: 0,
        };
      }

      setDashboardData(dashboardData);

      // Fetch chart data
      await fetchChartData(startDate, endDate);

      // Fetch recent activity using dedicated function
      await fetchRecentActivity();
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
      // Fallback to demo data
      setDashboardData({
        totalTickets: { value: 248, subtitle: "All teams" },
        aiChats: {
          value: "1,324",
          subtitle: "82% resolved by AI",
          trend: { type: "up", value: "+12%" },
        },
        totalMessages: {
          value: 1324,
          subtitle: "User queries received",
          trend: { type: "up", value: "+1324" },
        },
        ordersViaAI: {
          value: "$5,890",
          subtitle: "Last 7 days",
          trend: { type: "up", value: "+23%" },
        },
        topIntents: [
          { intent: "Where is my order?", percentage: 35, count: 35 },
          { intent: "Return / exchange", percentage: 22, count: 22 },
          { intent: "Product recommendations", percentage: 18, count: 18 },
          { intent: "Change address", percentage: 10, count: 10 },
          { intent: "Other", percentage: 15, count: 15 },
        ],
      });
      setRecentActivity([
        {
          id: "#109813",
          customerName: "Healthymomnutrition",
          message: "Delivered but not received. Filed UPS claim already…",
          status: "open",
          timestamp: "10:16 pm",
          channel: "Email",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch chart data from analytics endpoints
  const fetchChartData = useCallback(async (startDate, endDate) => {
    try {
      // Fetch both chats per day and revenue data in parallel
      const [chatsResponse, revenueResponse] = await Promise.all([
        chatApi.getAnalyticsChatsPerDay({ startDate, endDate }),
        chatApi.getAnalyticsRevenueFromOrders({ startDate, endDate })
      ]);

      const chatsData = chatsResponse.success ? chatsResponse.data : chatsResponse;
      const revenueData = revenueResponse.success ? revenueResponse.data : revenueResponse;

      // Combine the data for charts
      const combinedData = [];
      const chatsMap = new Map();
      const revenueMap = new Map();

      // Map chats per day
      if (chatsData.chatsPerDay) {
        chatsData.chatsPerDay.forEach(item => {
          chatsMap.set(item.date, item.count);
        });
      }

      // Map revenue per day
      if (revenueData.revenuePerDay) {
        revenueData.revenuePerDay.forEach(item => {
          revenueMap.set(item.date, item.revenue);
        });
      }

      // Create combined dataset
      const allDates = new Set([...chatsMap.keys(), ...revenueMap.keys()]);
      allDates.forEach(date => {
        const dateObj = new Date(date);
        combinedData.push({
          name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: date,
          chats: chatsMap.get(date) || 0,
          revenue: revenueMap.get(date) || 0
        });
      });

      // Sort by date
      combinedData.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

      setChartData(combinedData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      // Set empty chart data on error
      setChartData([]);
    }
  }, []);

  // Separate function for fetching recent activity
  const fetchRecentActivity = useCallback(async () => {
    try {
      console.log("Dashboard: Fetching recent chats...");
      const response = await chatApi.getChats({
        page: 1,
        limit: 5,
        filter: "all",
      });

      console.log("Dashboard: Chat API response:", response);

      if (response.success && response.data && response.data.chats) {
        const chatsArray = response.data.chats;
        console.log("Dashboard: Found chats:", chatsArray.length);

        // Convert chats to activity format using utility function
        const activityData = chatsArray.slice(0, 5).map(chatToActivity);

        console.log("Dashboard: Formatted activity data:", activityData);
        setRecentActivity(activityData);
        setLastUpdated(new Date());
      } else {
        console.log("Dashboard: No chats in response, using fallback");
        throw new Error("No chats data in response");
      }
    } catch (error) {
      console.log(
        "Failed to fetch recent chats, trying analytics endpoint:",
        error
      );

      try {
        // Fallback to analytics endpoint using API service
        const activity = await chatApi.getAnalyticsRecentActivity({ limit: 5 });
        console.log("Activity API response:", activity);

        // Extract activities from the API response structure
        const activityData = activity.success
          ? activity.data.activities
          : activity.activities || [];
        setRecentActivity(activityData);
      } catch (analyticsError) {
        console.log("Analytics endpoint failed, using demo data");
        // If analytics endpoint also fails, use demo data
        setRecentActivity([
          {
            id: "demo-fallback-1",
            type: "support",
            customerName: "fallback.customer@example.com",
            customer: "fallback.customer@example.com",
            timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            timeAgo: "3m ago",
            sessionId: "fallback-session-1",
            status: "active",
            conversationType: "support",
            messagePreview: "Customer support request",
            latestMessage: "Support conversation started",
          },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, fetchDashboardData]);

  // Separate effect for refreshing recent chats more frequently
  useEffect(() => {
    // Set up polling every 30 seconds for recent chats (less frequent than chats page)
    const interval = setInterval(() => {
      fetchRecentActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRecentActivity]);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
  };

  // Handle clicking on a chat item to navigate to chat details
  const handleChatClick = (activity) => {
    if (activity.sessionId || activity.id) {
      // Navigate to the specific chat using route param
      const chatId = activity.sessionId || activity.id.replace("#", "");
      navigate(`/chats/${chatId}`);
    } else {
      // Fallback to general chats page
      navigate("/chats");
    }
  };

  // Prepare KPI data from dashboard response
  const kpis = dashboardData
    ? [
        {
          label: "AI Chats (last 24h)",
          value: dashboardData.aiChats?.total?.toString() || "0",
          sub: dashboardData.aiChats?.resolutionRate || "0% resolved by AI",
          trend:
            dashboardData.aiChats?.total > 0
              ? { type: "up", value: "+" + dashboardData.aiChats.total }
              : null,
          color: "#3b82f6",
          sparklineData: chartData.length > 0 
            ? chartData.slice(-7).map(d => ({ value: d.chats }))
            : null
        },
        {
          label: "Total Queries",
          value: dashboardData.totalQueries?.total?.toString() || "0",
          sub: `Avg ${dashboardData.totalQueries?.averagePerChat || 0} per chat`,
          trend:
            dashboardData.totalQueries?.total > 0
              ? { type: "up", value: "+" + dashboardData.totalQueries.total }
              : null,
          color: "#f59e0b",
          sparklineData: null
        },
        {
          label: "Open Tickets",
          value: dashboardData.humanEscalations?.activeTickets?.toString() || "0",
          sub: "Need attention",
          trend:
            dashboardData.humanEscalations?.total > 0
              ? {
                  type: "neutral",
                  value: dashboardData.humanEscalations.total + " total this period",
                }
              : null,
          color: "#f59e0b",
          sparklineData: null
        },
        {
          label: "Total Customers",
          value: dashboardData.customers?.totalCustomers?.toString() || "0",
          sub: `${dashboardData.customers?.newCustomers || 0} new customers`,
          trend:
            dashboardData.customers?.newCustomers > 0
              ? {
                  type: "up",
                  value: "+" + dashboardData.customers.newCustomers,
                }
              : null,
          color: "#8b5cf6",
          sparklineData: null // No historical customer count yet
        },
      ]
    : [];

  // Generate AI insights based on dashboard data
  const generateInsights = () => {
    if (!dashboardData) return [];

    const insights = [];
    const resolutionRate = parseInt(dashboardData.aiChats?.resolutionRate) || 0;
    const totalQueries = dashboardData.totalMessages?.total || dashboardData.aiChats?.total || 0;
    const orderCount = dashboardData.ordersViaAI?.orderCount || 0;

    if (resolutionRate > 80) {
      insights.push({
        type: 'success',
        title: 'Excellent AI Performance',
        description: `Your AI is resolving ${resolutionRate}% of chats automatically. That's outstanding!`,
        action: null
      });
    }

    if (totalQueries > 50) {
      insights.push({
        type: 'info',
        title: 'High Query Volume',
        description: `${totalQueries} user queries received. Your AI is actively helping customers!`,
        action: null
      });
    }

    if (orderCount > 0) {
      insights.push({
        type: 'info',
        title: 'AI-Driven Revenue',
        description: `Your chatbot generated ${orderCount} orders this period. Revenue engine is working!`,
        action: {
          label: 'View orders',
          onClick: () => navigate('/orders')
        }
      });
    }

    // Note: Removed 'Active Chats Need Attention' alert since AI handles all chats automatically

    return insights.slice(0, 3); // Max 3 insights
  };

  const insights = generateInsights();

  return (
    <div className="min-h-full w-full p-6 bg-[#151a1e]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-gray-400">
            Monitor your AI customer service performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomSelect
            value={dateRange}
            onChange={handleDateRangeChange}
            disabled={loading}
            options={[
              { value: "1", label: "Today" },
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 3 months" },
            ]}
          />
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>Refresh</>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-400">!</span>
            <span className="text-red-300 text-sm">
              Error loading dashboard data: {error}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {loading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <AnimatedStatCard key={i} isLoading={true} />
            ))
          : kpis.map((k, index) => (
              <AnimatedStatCard key={index} {...k} />
            ))}
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">AI Insights & Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))}
          </div>
        </div>
      )}

      {/* Main content area */}
      <Row>
        {/* Left: Recent Activity */}
        <div className="lg:col-span-8">
          <div className={`${cardBase} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Recent Activity
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-400">
                    Latest customer interactions and support tickets
                  </p>
                  {lastUpdated && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span>Updated {formatTimeAgo(lastUpdated)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchRecentActivity}
                  className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors duration-200"
                  title="Refresh recent activity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => navigate("/tickets")}
                  className="px-3 py-1.5 text-xs rounded-md bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors duration-200"
                >
                  View All Tickets
                </button>
                <button
                  onClick={() => navigate("/chats")}
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  View All Chats
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {loading ? (
                // Loading skeleton for activity
                Array.from({ length: 5 }).map((_, i) => (
                  <RecentActivityItem key={i} isLoading={true} />
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <RecentActivityItem
                    key={activity.id || index}
                    activity={activity}
                    onClick={() => handleChatClick(activity)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No recent activity found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Customer interactions will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Charts row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${cardBase} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    AI Chats per Day
                  </h3>
                  <p className="text-sm text-gray-400">
                    Daily conversation volume trends
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="h-48 rounded-lg bg-[#151a1e] border border-dashed border-[#293239] flex items-center justify-center animate-pulse">
                  <div className="text-gray-500 text-sm">Loading chart...</div>
                </div>
              ) : (
                <AreaChart data={chartData} dataKey="chats" color="#3b82f6" height={200} />
              )}
            </div>
            
            <div className={`${cardBase} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Revenue from AI Orders
                  </h3>
                  <p className="text-sm text-gray-400">
                    Revenue generated through chatbot
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="h-48 rounded-lg bg-[#151a1e] border border-dashed border-[#293239] flex items-center justify-center animate-pulse">
                  <div className="text-gray-500 text-sm">Loading chart...</div>
                </div>
              ) : (
                <BarChart data={chartData} dataKey="revenue" height={200} />
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar with mini stats */}
        <div className="lg:col-span-4 space-y-6">
          <MiniStat
            title="Active Customers"
            subtitle="This period"
            value={
              loading
                ? "..."
                : dashboardData?.customers?.activeCustomers?.toString() || "0"
            }
            footnote="Currently active"
            isLoading={loading}
          />
          <MiniStat
            title="New Customers"
            subtitle="This period"
            value={
              loading
                ? "..."
                : dashboardData?.customers?.newCustomers?.toString() || "0"
            }
            footnote="First time visitors"
            isLoading={loading}
          />

          {/* Top Intents */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">
                Top Customer Intents
              </h3>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-600 rounded w-8"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.topIntents ? (
              <ul className="space-y-3">
                {dashboardData.topIntents
                  .filter((intent) => intent.count > 0) // Only show intents with data
                  .map((intent, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm group"
                    >
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                        {intent.intent}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${intent.percentage}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-400 w-8 text-right">
                          {intent.percentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                {dashboardData.topIntents.filter((intent) => intent.count > 0)
                  .length === 0 && (
                  <li className="text-center py-4">
                    <p className="text-gray-400 text-sm">
                      No intent data available yet
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Data will appear as customers interact
                    </p>
                  </li>
                )}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  No intent data available
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`${cardBase} p-5`}>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/chats")}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                View Active Chats
              </button>
              <button
                onClick={() => navigate("/customers")}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Manage Customers
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </Row>
    </div>
  );
}
