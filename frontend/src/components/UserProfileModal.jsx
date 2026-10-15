import React, { useRef } from "react";
import { Camera, LogOut, X, ShieldCheck, GraduationCap, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, avatar, updateAvatar, resetAvatar, logout, isTeacher } = useAuth();
  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High quality square resize to 320x320 for speed and storage efficiency
        const canvas = document.createElement("canvas");
        const size = 320;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        updateAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="apple-card relative z-10 w-full max-w-sm rounded-3xl p-6 sm:p-7 border border-[#CCE6FF] dark:border-[#0062FF]/30 bg-white dark:bg-[#080E1E] shadow-2xl animate-slide-up">
        
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#CCE6FF]/70 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0062FF] dark:text-[#38A6FF]">
            {isTeacher ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            <span>{isTeacher ? "Faculty Account" : "Student Account"}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar with Camera Overlay */}
        <div className="text-center py-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-[#0B1426] shadow-[0_4px_25px_rgba(0,98,255,0.25)] group cursor-pointer"
            title="Click to take photo from device or choose image"
          >
            <img
              src={avatar}
              alt={user.full_name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 mb-0.5" />
              <span className="text-[10px] font-bold">Change</span>
            </div>
          </div>

          {/* Hidden File Input for Device Photo / Gallery */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {/* Photo Actions */}
          <div className="mt-3 flex items-center justify-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#EDF6FF] dark:bg-[#0062FF]/15 border border-[#CCE6FF] dark:border-[#0062FF]/30 text-[#0062FF] dark:text-[#38A6FF] text-xs font-semibold hover:bg-[#CCE6FF]/40 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo / Upload</span>
            </button>

            {avatar !== "/default_avatar.png" && (
              <button
                onClick={resetAvatar}
                type="button"
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Reset to default avatar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Details */}
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {user.full_name}
          </h3>
          <p className="text-xs text-[#0062FF] dark:text-[#38A6FF] font-semibold mt-0.5">
            {user.email}
          </p>

          {user.prn && (
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              PRN: <span className="font-bold text-slate-700 dark:text-slate-300">{user.prn}</span>
            </p>
          )}

          {user.department && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {user.department}
            </p>
          )}

          {user.year && (
            <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDF6FF] dark:bg-[#0062FF]/10 text-slate-700 dark:text-slate-300 border border-[#CCE6FF] dark:border-[#0062FF]/30">
              <span className="text-[#0062FF] dark:text-[#38A6FF] font-bold">{user.year}</span>
              <span>•</span>
              {user.scheme && (
                <>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{user.scheme}</span>
                  <span>•</span>
                </>
              )}
              <span>{user.semester}</span>
            </div>
          )}

          {isTeacher && user.teaching_courses && user.teaching_courses.length > 0 && (
            <div className="mt-3 p-2.5 rounded-2xl bg-[#EDF6FF] dark:bg-[#0062FF]/10 border border-[#CCE6FF] dark:border-[#0062FF]/30 text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-[#38A6FF] mb-1.5">
                Assigned Teaching Courses
              </span>
              <div className="flex flex-wrap gap-1">
                {user.teaching_courses.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-[#CCE6FF] dark:border-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout Option at the End inside Profile Option */}
        <div className="pt-3 border-t border-[#CCE6FF]/70 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            type="button"
            className="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs border border-red-200 dark:border-red-900/50 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
