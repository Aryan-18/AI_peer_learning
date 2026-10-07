import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center w-20 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#38A6FF] cursor-pointer shadow-inner ${
        isDark 
          ? "bg-[#0B1426] border border-blue-500/30" 
          : "bg-[#CCE6FF] border border-[#99D1FF]"
      }`}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Sliding white circular thumb */}
      <span
        className={`w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-300 ease-out transform ${
          isDark ? "translate-x-1" : "translate-x-11"
        }`}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-[#0062FF] stroke-[2.5]" />
        ) : (
          <Moon className="w-5 h-5 text-[#0062FF] stroke-[2.5] fill-[#0062FF]" />
        )}
      </span>
    </button>
  );
}
