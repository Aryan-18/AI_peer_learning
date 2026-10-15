import React, { useState } from "react";
import { GraduationCap, ShieldCheck, Lock, Mail, User, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import GoogleSignInModal from "../components/GoogleSignInModal";
import FacultyCourseSelector from "../components/FacultyCourseSelector";

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [prn, setPrn] = useState("");
  const [department] = useState("Computer Science Engineering (Artificial Intelligence & Machine Learning)");
  const [year, setYear] = useState("Second Year (SY)");
  const [semester, setSemester] = useState("Semester III");
  const [scheme, setScheme] = useState("Scheme A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleYearChange = (newYear) => {
    setYear(newYear);
    if (newYear === "Second Year (SY)") {
      setSemester("Semester III");
    } else if (newYear === "Third Year (TY)") {
      setSemester("Semester V");
    } else if (newYear === "Final Year (B.Tech)") {
      setSemester("Semester VII");
    }
  };

  const isDomainInvalid = email.length > 5 && !email.toLowerCase().endsWith("@pccoepune.org");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.toLowerCase().endsWith("@pccoepune.org")) {
      setError("Institutional Security Policy: Email must end with @pccoepune.org");
      return;
    }

    if (role === "student" && !prn.trim()) {
      setError("Student PRN is mandatory for academic registration.");
      return;
    }

    if (role === "teacher" && teachingCourses.length === 0) {
      setError("Please select at least one course that you teach.");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email: email,
        password: password,
        role: role,
        prn: role === "student" ? prn.trim().toUpperCase() : null,
        department: department,
        year: role === "student" ? year : null,
        semester: role === "student" ? semester : null,
        scheme: role === "student" && year === "Final Year (B.Tech)" ? scheme : null,
        teaching_courses: role === "teacher" ? teachingCourses : null,
      });
    } catch (err) {
      setError(err.message || "Failed to register institutional account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className={`w-full ${role === "teacher" ? "max-w-lg" : "max-w-md"} transition-all duration-300`}>
        
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#0062FF] dark:text-[#38A6FF] font-semibold">
            Join the Peer AI Collaborative Learning Network
          </p>
        </div>

        {/* Card */}
        <div className="apple-card rounded-3xl p-6 sm:p-8 shadow-2xl border">
          
          {/* Role Picker */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#EDF6FF] dark:bg-slate-900/80 border border-[#CCE6FF] dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setRole("student"); setError(""); }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                role === "student"
                  ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole("teacher"); setError(""); }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                role === "teacher"
                  ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Faculty</span>
            </button>
          </div>

          {/* Google Workspace Sign-Up Option */}
          <div className="mb-4">
            <GoogleSignInButton
              role={role}
              onError={(msg) => setError(msg)}
              onClick={() => setIsGoogleModalOpen(true)}
              text="Sign up with PCCOE Google Account"
            />
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-[#CCE6FF] dark:border-slate-800"></div>
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              or fill details manually
            </span>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs animate-slide-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-[#38A6FF]" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Institutional Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email (@pccoepune.org)
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
                  placeholder="your.name@pccoepune.org"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border ${
                    isDomainInvalid
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-[#CCE6FF] dark:border-slate-700/80 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20"
                  } text-slate-900 dark:text-white placeholder-slate-400 outline-none`}
                />
              </div>
              {isDomainInvalid && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 inline" />
                  Must strictly end with <strong>@pccoepune.org</strong>
                </p>
              )}
            </div>

            {/* PRN if student */}
            {role === "student" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Permanent Registration Number (PRN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4 text-[#38A6FF]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    placeholder="Enter your PRN (e.g. 124B1C001)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/20 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Courses Taught if Faculty */}
            {role === "teacher" && (
              <div className="pt-1 animate-fade-in">
                <FacultyCourseSelector
                  selectedCourses={teachingCourses}
                  onChange={setTeachingCourses}
                />
              </div>
            )}

            {/* Year Studying if student */}
            {role === "student" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Year Studying
                </label>
                <select
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
                >
                  <option value="Second Year (SY)">Second Year (SY)</option>
                  <option value="Third Year (TY)">Third Year (TY)</option>
                  <option value="Final Year (B.Tech)">Final Year (B.Tech)</option>
                </select>
              </div>
            )}

            {/* Curriculum Scheme if Final Year */}
            {role === "student" && year === "Final Year (B.Tech)" && (
              <div className="p-3 rounded-2xl bg-[#EDF6FF] dark:bg-[#0062FF]/10 border border-[#CCE6FF] dark:border-[#0062FF]/30 animate-fade-in">
                <label className="block text-xs font-bold text-[#0062FF] dark:text-[#38A6FF] mb-1.5">
                  Final Year Curriculum Scheme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheme("Scheme A")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      scheme === "Scheme A"
                        ? "bg-[#0062FF] text-white border-[#0062FF] shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CCE6FF] dark:border-slate-700"
                    }`}
                  >
                    Scheme A
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheme("Scheme B")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      scheme === "Scheme B"
                        ? "bg-[#0062FF] text-white border-[#0062FF] shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CCE6FF] dark:border-slate-700"
                    }`}
                  >
                    Scheme B
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Select your assigned B.Tech final-year track structure.
                </p>
              </div>
            )}

            {/* Current Semester if student */}
            {role === "student" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
                >
                  {year === "Second Year (SY)" && (
                    <>
                      <option value="Semester III">Semester III</option>
                      <option value="Semester IV">Semester IV</option>
                    </>
                  )}
                  {year === "Third Year (TY)" && (
                    <>
                      <option value="Semester V">Semester V</option>
                      <option value="Semester VI">Semester VI</option>
                    </>
                  )}
                  {year === "Final Year (B.Tech)" && (
                    <>
                      <option value="Semester VII">Semester VII</option>
                      <option value="Semester VIII">Semester VIII</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-[#0062FF] via-[#0A7AFF] to-[#1A8CFF] hover:from-[#0047BA] hover:to-[#0062FF] text-white font-bold text-sm shadow-[0_0_20px_rgba(0,98,255,0.35)] hover:shadow-[0_0_30px_rgba(0,98,255,0.55)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Complete Institutional Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#0062FF] font-medium transition-colors cursor-pointer"
            >
              Already registered? <span className="font-bold text-[#0062FF] dark:text-[#38A6FF] underline">Sign In instead</span>
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
