// src/components/WithProviders.jsx
import { useEffect } from "react";
import { AuthProvider } from "../auth/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import { notificationService } from "../services/notificationService";
import "react-toastify/dist/ReactToastify.css";

// Toast notification helper with priority-based styling
const showToast = (notification) => {
  const options = {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClick: () => {
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    },
  };

  // Get display title with emoji
  const displayTitle = `${notification.emoji || "🔔"} ${notification.title}`;
  const toastId = `${notification.priority}-${notification.id}`;

  // Priority-based styling and timing
  switch (notification.priority) {
    case "urgent":
      toast.error(displayTitle, {
        ...options,
        autoClose: 10000, // Keep urgent notifications longer
        toastId, // Prevent duplicates
        className: "!border-l-4 !border-l-red-500",
      });
      break;
    case "high":
      toast.warn(displayTitle, {
        ...options,
        autoClose: 8000,
        toastId,
        className: "!border-l-4 !border-l-orange-500",
      });
      break;
    case "medium":
      toast.info(displayTitle, {
        ...options,
        autoClose: 5000,
        toastId,
        className: "!border-l-4 !border-l-yellow-500",
      });
      break;
    case "low":
      toast.success(displayTitle, {
        ...options,
        autoClose: 4000,
        toastId,
        className: "!border-l-4 !border-l-green-500",
      });
      break;
    default:
      toast(displayTitle, {
        ...options,
        autoClose: 5000,
        toastId,
        className: "!border-l-4 !border-l-blue-500",
      });
  }
};

// Priority-aware sound notification helper
const playNotificationSound = (notification) => {
  // Check if sound is enabled (user preference)
  const soundEnabled = localStorage.getItem("notificationSound") !== "false";

  if (!soundEnabled) return;

  // Check priority-specific sound settings
  const urgentSoundEnabled =
    localStorage.getItem("urgentNotificationSound") !== "false";
  const mediumSoundEnabled =
    localStorage.getItem("mediumNotificationSound") !== "false";

  // Skip sound for low priority if medium sounds are disabled
  if (notification.priority === "low" && !mediumSoundEnabled) return;
  if (notification.priority === "medium" && !mediumSoundEnabled) return;
  if (notification.priority === "urgent" && !urgentSoundEnabled) return;

  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different priorities
    switch (notification.priority) {
      case "urgent":
        // Urgent: Higher pitch, longer duration, multiple beeps
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;

      case "high":
        // High: Medium pitch, medium duration
        oscillator.frequency.value = 900;
        gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.4
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;

      case "medium":
        // Medium: Standard notification sound
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case "low":
        // Low: Lower pitch, shorter duration
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;

      default:
        // Default sound
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.log("Could not play notification sound:", error);
  }
};

// Browser notification helper
const showBrowserNotification = (notification) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
      requireInteraction: notification.priority === "urgent",
    });
  }
};

function NotificationHandler() {
  useEffect(() => {
    // Request browser notification permission on first load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Listen for new notifications and show toasts
    const handleNewNotification = (notification) => {
      console.log("🔔 New notification received:", notification);

      // Show toast notification
      showToast(notification);

      // Play sound notification
      playNotificationSound(notification);

      // Show browser notification
      showBrowserNotification(notification);
    };

    const handleConnectionError = (error) => {
      toast.error(`Connection error: ${error}`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    };

    const handleReconnected = (attemptNumber) => {
      toast.success(
        `Reconnected to notification service after ${attemptNumber} attempts`,
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );
    };

    // Subscribe to notification events
    notificationService.on("notification", handleNewNotification);
    notificationService.on("connectionError", handleConnectionError);
    notificationService.on("reconnected", handleReconnected);

    return () => {
      // Cleanup listeners
      notificationService.off("notification", handleNewNotification);
      notificationService.off("connectionError", handleConnectionError);
      notificationService.off("reconnected", handleReconnected);
    };
  }, []);

  return null;
}

export default function WithProviders({ children }) {
  return (
    <AuthProvider>
      <NotificationHandler />
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="!bg-[#1d2328] !text-[#d8dcde] !border !border-[#293239]"
        progressClassName="!bg-blue-500"
        closeButton={({ closeToast }) => (
          <button
            onClick={closeToast}
            className="text-[#d8dcde] hover:text-white text-lg leading-none p-1"
          >
            ×
          </button>
        )}
      />
    </AuthProvider>
  );
}
