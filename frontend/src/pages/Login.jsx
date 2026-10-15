import React, { useState } from "react";
import { GraduationCap, ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import GoogleSignInModal from "../components/GoogleSignInModal";

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [role, setRole] = useState("student"); // "student" or "teacher"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const isDomainInvalid = email.length > 5 && !email.toLowerCase().endsWith("@pccoepune.org");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.toLowerCase().endsWith("@pccoepune.org")) {
      setError("Institutional Security Policy: Email must end with @pccoepune.org");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Failed to authenticate with institutional credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-md">
        
        {/* Page Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back to Peer AI
          </h2>
        </div>

        {/* Minimalist White Card on Reference Ice Blue Background */}
        <div className="apple-card rounded-3xl p-6 sm:p-8 shadow-2xl border">
          
          {/* Role Picker */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#EDF6FF] dark:bg-slate-900/80 border border-[#CCE6FF] dark:border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => { setRole("student"); setError(""); }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                role === "student"
                  ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole("teacher"); setError(""); }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                role === "teacher"
                  ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Teacher Portal</span>
            </button>
          </div>

          {/* Google Sign-In Option */}
          <div className="mb-4">
            <GoogleSignInButton
              role={role}
              onError={(msg) => setError(msg)}
              onClick={() => setIsGoogleModalOpen(true)}
              text="Sign in with PCCOE Google Account"
            />
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-[#CCE6FF] dark:border-slate-800"></div>
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              or enter password
            </span>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs animate-slide-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-[#38A6FF]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@pccoepune.org"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all duration-200 bg-white/90 dark:bg-slate-900/70 border ${
                    isDomainInvalid
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-[#CCE6FF] dark:border-slate-700/80 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20"
                  } text-slate-900 dark:text-white placeholder-slate-400 outline-none`}
                />
              </div>

              {/* Real-time Domain Hint */}
              {isDomainInvalid && (
                <p className="mt-1.5 text-[11px] text-red-500 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 inline" />
                  Must strictly end with <strong>@pccoepune.org</strong>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-[#38A6FF]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all duration-200 bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Submit Button in Reference Blue */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#0062FF] via-[#0A7AFF] to-[#1A8CFF] hover:from-[#0047BA] hover:to-[#0062FF] text-white font-bold text-sm shadow-[0_0_20px_rgba(0,98,255,0.35)] hover:shadow-[0_0_30px_rgba(0,98,255,0.55)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In as {role === "teacher" ? "Faculty" : "Student"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-4 border-t border-[#CCE6FF] dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#0062FF] dark:hover:text-[#38A6FF] font-medium transition-colors cursor-pointer"
            >
              Don't have an account yet? <span className="font-bold text-[#0062FF] dark:text-[#38A6FF] underline">Register here</span>
            </button>
          </div>

        </div>

        {/* Google Authentication Modal */}
        <GoogleSignInModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          initialRole={role}
        />

      </div>
    </div>
  );
}
