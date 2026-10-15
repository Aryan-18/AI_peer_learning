import React, { useState, useEffect, useRef } from "react";
import { Shield, X, AlertCircle, GraduationCap, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FacultyCourseSelector from "./FacultyCourseSelector";

export default function GoogleSignInModal({ isOpen, onClose, initialRole = "student" }) {
  const { googleLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [customTeachingCourses, setCustomTeachingCourses] = useState([]);
  const [customYear, setCustomYear] = useState("Second Year (SY)");
  const [customSemester, setCustomSemester] = useState("Semester III");
  const [customScheme, setCustomScheme] = useState("Scheme A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalGoogleBtnRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleCustomYearChange = (newYear) => {
    setCustomYear(newYear);
    if (newYear === "Second Year (SY)") {
      setCustomSemester("Semester III");
    } else if (newYear === "Third Year (TY)") {
      setCustomSemester("Semester V");
    } else if (newYear === "Final Year (B.Tech)") {
      setCustomSemester("Semester VII");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSelectedRole(initialRole);
    }
  }, [isOpen, initialRole]);

  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    const initGis = () => {
      if (window.google?.accounts?.id && modalGoogleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            hosted_domain: "pccoepune.org",
            callback: async (response) => {
              if (response.credential) {
                setLoading(true);
                setError("");
                try {
                  await googleLogin({
                    credential: response.credential,
                    role: selectedRole,
                    department: "Computer Science Engineering (Artificial Intelligence & Machine Learning)",
                    year: selectedRole === "student" ? customYear : null,
                    semester: selectedRole === "student" ? customSemester : null,
                    scheme: selectedRole === "student" && customYear === "Final Year (B.Tech)" ? customScheme : null,
                    teaching_courses: selectedRole === "teacher" ? customTeachingCourses : null,
                  });
                  onClose();
                } catch (err) {
                  setError(err.message || "Google authentication failed. Only verified @pccoepune.org accounts are allowed.");
                } finally {
                  setLoading(false);
                }
              }
            },
          });

          window.google.accounts.id.renderButton(modalGoogleBtnRef.current, {
            theme: "filled_blue",
            size: "large",
            width: 340,
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
          });
        } catch (e) {
          console.warn("GIS modal render error:", e);
        }
      }
    };

    const timer = setTimeout(initGis, 150);
    return () => clearTimeout(timer);
  }, [isOpen, googleClientId, selectedRole, customYear, customSemester, customScheme, customTeachingCourses, googleLogin, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="apple-card w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Google Logo */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-[#CCE6FF] dark:border-slate-700/80 shadow-sm flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Sign in with Google
            </h3>
            <p className="text-xs text-[#0062FF] dark:text-[#38A6FF] font-semibold">
              PCCOE Institutional Single Sign-On (SSO)
            </p>
          </div>
        </div>

        {/* Domain Enforcement Notice */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#EDF6FF] dark:bg-[#0062FF]/10 border border-[#CCE6FF] dark:border-[#0062FF]/30 flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-300">
          <Shield className="w-4 h-4 text-[#0062FF] dark:text-[#38A6FF] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#0062FF] dark:text-[#38A6FF]">Institutional Domain Restriction:</span> Only authentic accounts ending with <strong className="underline">@pccoepune.org</strong> verified by Google Identity Services can authenticate.
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-2.5 text-red-700 dark:text-red-300 text-xs animate-slide-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Role Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("student")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  selectedRole === "student"
                    ? "bg-[#0062FF] text-white border-[#0062FF]"
                    : "bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#CCE6FF] dark:border-slate-800"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("teacher")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  selectedRole === "teacher"
                    ? "bg-[#0062FF] text-white border-[#0062FF]"
                    : "bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#CCE6FF] dark:border-slate-800"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>
            </div>
          </div>

          {/* Academic Year, Scheme & Semester if student */}
          {selectedRole === "student" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Year Studying
                  </label>
                  <select
                    value={customYear}
                    onChange={(e) => handleCustomYearChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl text-xs bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
                  >
                    <option value="Second Year (SY)">Second Year (SY)</option>
                    <option value="Third Year (TY)">Third Year (TY)</option>
                    <option value="Final Year (B.Tech)">Final Year (B.Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={customSemester}
                    onChange={(e) => setCustomSemester(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl text-xs bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
                  >
                    {customYear === "Second Year (SY)" && (
                      <>
                        <option value="Semester III">Semester III</option>
                        <option value="Semester IV">Semester IV</option>
                      </>
                    )}
                    {customYear === "Third Year (TY)" && (
                      <>
                        <option value="Semester V">Semester V</option>
                        <option value="Semester VI">Semester VI</option>
                      </>
                    )}
                    {customYear === "Final Year (B.Tech)" && (
                      <>
                        <option value="Semester VII">Semester VII</option>
                        <option value="Semester VIII">Semester VIII</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {customYear === "Final Year (B.Tech)" && (
                <div className="p-2.5 rounded-xl bg-[#EDF6FF] dark:bg-[#0062FF]/10 border border-[#CCE6FF] dark:border-[#0062FF]/30">
                  <label className="block text-[11px] font-bold text-[#0062FF] dark:text-[#38A6FF] mb-1">
                    Final Year Scheme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomScheme("Scheme A")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        customScheme === "Scheme A"
                          ? "bg-[#0062FF] text-white border-[#0062FF]"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CCE6FF] dark:border-slate-700"
                      }`}
                    >
                      Scheme A
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomScheme("Scheme B")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        customScheme === "Scheme B"
                          ? "bg-[#0062FF] text-white border-[#0062FF]"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CCE6FF] dark:border-slate-700"
                      }`}
                    >
                      Scheme B
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses Taught if Faculty */}
          {selectedRole === "teacher" && (
            <div className="pt-1 animate-fade-in">
              <FacultyCourseSelector
                selectedCourses={customTeachingCourses}
                onChange={setCustomTeachingCourses}
              />
            </div>
          )}

          {/* Official Google Sign-In Action */}
          <div className="pt-3">
            {googleClientId ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Click below to choose your official <strong className="text-slate-700 dark:text-slate-200">@pccoepune.org</strong> Google Workspace account:
                </p>
                <div ref={modalGoogleBtnRef} className="flex justify-center min-h-[44px]"></div>
                {loading && (
                  <div className="flex items-center space-x-2 text-xs text-[#0062FF] dark:text-[#38A6FF] font-medium">
                    <span className="inline-block w-4 h-4 border-2 border-[#0062FF] border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Google cryptographic token...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span>Google Client ID Configuration Required</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Official Google Single Sign-On requires a configured Google OAuth 2.0 Client ID. Please set <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900 font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> in your <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900 font-mono text-[10px]">.env</code> file.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
