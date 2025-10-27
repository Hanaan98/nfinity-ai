// src/routes/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import WithProviders from "../components/WithProviders";
import RequireAuth from "../auth/RequireAuth";

import PageLayout from "../components/PageLayout";
import Dashboard from "../pages/Dashboard";
import ChatsWithPolling from "../pages/ChatsWithPolling";
import Orders from "../pages/Orders";
import Customers from "../pages/Customers";
import CustomerDetails from "../pages/CustomerDetails";
import Tickets from "../pages/Tickets";
import TicketDetail from "../pages/TicketDetails";
import Notifications from "../pages/Notifications";
import NotificationDemo from "../components/notifications/NotificationDemo";
import Login from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import SetupPassword from "../pages/SetupPassword";
import Settings from "../pages/Settings";

export const router = createBrowserRouter([
  // Public authentication routes
  {
    path: "/login",
    element: (
      <WithProviders>
        <Login />
      </WithProviders>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <WithProviders>
        <ForgotPassword />
      </WithProviders>
    ),
  },
  {
    path: "/setup-password",
    element: (
      <WithProviders>
        <SetupPassword />
      </WithProviders>
    ),
  },

  // Protected app shell
  {
    path: "/",
    element: (
      <WithProviders>
        <RequireAuth>
          <PageLayout />
        </RequireAuth>
      </WithProviders>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "chats", element: <ChatsWithPolling /> },
      { path: "orders", element: <Orders /> },
      {
        path: "customers",
        children: [
          { index: true, element: <Customers /> },
          { path: ":customerId", element: <CustomerDetails /> },
        ],
      },
      { path: "settings", element: <Settings /> },
      { path: "notifications", element: <Notifications /> },
      { path: "notifications/demo", element: <NotificationDemo /> },
      {
        path: "tickets",
        children: [
          { index: true, element: <Tickets /> },
          { path: "details", element: <TicketDetail /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
