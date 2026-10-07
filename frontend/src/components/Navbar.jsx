import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import UserProfileModal from "./UserProfileModal";

export default function Navbar() {
  const { user, avatar } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-nav transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Top Left of the white bar: Peer AI Logo + Title + Tagline */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#080E1E] p-1.5 flex items-center justify-center shadow-[0_4px_20px_rgba(0,98,255,0.22)] border border-[#CCE6FF] dark:border-blue-500/30 flex-shrink-0 transition-all hover:scale-105">
              <img
                src="/peer_ai_icon.png"
                alt="Peer AI Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,98,255,0.25)]"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                Peer <span className="text-[#0062FF] dark:text-[#38A6FF]">AI</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-[#0062FF] dark:text-[#38A6FF] font-semibold tracking-tight mt-0.5">
                AI-Powered Collaborative Learning
              </p>
            </div>
          </div>

          {/* Right side: Circular Avatar Profile Icon (Second Attachment) & Large Theme Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user && (
              <button
                onClick={() => setIsProfileOpen(true)}
                type="button"
                className="relative group p-0.5 rounded-full transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0062FF] cursor-pointer"
                title="Click to view profile, change photo, or sign out"
                aria-label="User profile"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#CCE6FF] dark:border-[#0062FF]/50 shadow-[0_2px_12px_rgba(0,98,255,0.2)] bg-slate-200 dark:bg-slate-800">
                  <img
                    src={avatar}
                    alt={user.full_name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#040711]" />
              </button>
            )}

            {/* Large Theme Toggle */}
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
