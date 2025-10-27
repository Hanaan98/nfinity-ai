// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider"; // make sure you have this
import { NotificationBell } from "./notifications";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-between w-full px-6 py-2 bg-[#151a1e] border-b border-b-[#293239]">
      <div className="flex items-center gap-3">
        {/* Empty space for future content */}
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Optional icons for later use */}
        {/* <button className="text-[#d8dcde] hover:text-[#d8dcdecc]">
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>
        <button className="text-[#d8dcde] hover:text-[#d8dcdecc]">
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button> */}

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#d8dcde] hover:text-[#d8dcdecc] rounded-full p-1 transition"
          >
            <UserCircleIcon className="w-7 h-7" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#1d2328] border border-[#293239]  shadow-lg z-50">
              <div className="px-4 py-3 border-b border-[#293239]">
                <p className="text-sm text-gray-200">
                  {user?.email || "user@demo.com"}
                </p>
                <p className="text-xs text-gray-500">Active session</p>
              </div>

              <ul className="text-sm text-gray-300">
                <li>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/5"
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
