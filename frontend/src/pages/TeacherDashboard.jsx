import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Sparkles, 
  Download, Users, BrainCircuit, RefreshCw, FileText, Check, ArrowRight,
  ShieldAlert, ChevronRight, BarChart3, Award
} from "lucide-react";
import { teacherApi, subjectApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import UserProfileModal from "../components/UserProfileModal";
import InteractiveExcelGrid from "../components/InteractiveExcelGrid";

export default function TeacherDashboard() {
  const { user, avatar } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pairings"); // "pairings" | "upload" | "students"
  const [ingestionMode, setIngestionMode] = useState("direct"); // "direct" | "file"
  const [students, setStudents] = useState([]);
  const [pairings, setPairings] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [strategy, setStrategy] = useState("complementary"); // "complementary" | "balanced"

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // AI Matching execution state
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingSuccess, setMatchingSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subs, stus, pairs] = await Promise.all([
        subjectApi.getSubjects(),
        teacherApi.getStudents(),
        teacherApi.getPairings()
      ]);
      setSubjects(subs);
      setStudents(stus);
      setPairings(pairs);
      if (subs.length > 0 && !selectedSubject) {
        setSelectedSubject(subs[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load teacher dashboard data:", err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    setUploadError("");
    setUploadResult(null);
    setUploadLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await teacherApi.uploadFile(formData);
      setUploadResult(res);
      if (res.success) {
        await loadData();
      }
    } catch (err) {
      setUploadError(err.message || "Failed to process student records file.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRunMatching = async () => {
    setMatchingLoading(true);
    setMatchingSuccess("");
    try {
      const subId = selectedSubject ? parseInt(selectedSubject) : null;
      const res = await teacherApi.runMatching(subId, strategy);
      setMatchingSuccess(res.message);
      const updatedPairs = await teacherApi.getPairings(subId);
      setPairings(updatedPairs);
    } catch (err) {
      alert("AI Matching Error: " + (err.message || "Failed to execute algorithm."));
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleSubjectFilterChange = async (subId) => {
    setSelectedSubject(subId);
    try {
      const pairs = await teacherApi.getPairings(subId ? parseInt(subId) : null);
      setPairings(pairs);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-[#CCE6FF] dark:border-slate-800 gap-4">
        <div>
          {/* User Profile Avatar Pill on Left in place of Third Attachment */}
          <button
            onClick={() => setIsProfileOpen(true)}
            type="button"
            className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0B1426] border border-[#CCE6FF] dark:border-[#0062FF]/30 shadow-sm hover:shadow-md hover:border-[#0062FF] transition-all cursor-pointer mb-2.5 group"
            title="Click to view profile & change photo"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#99D1FF] dark:border-[#0062FF]/40 flex-shrink-0">
              <img
                src={avatar}
                alt="Faculty Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0062FF] dark:group-hover:text-[#38A6FF] transition-colors">
              {user?.full_name || "Faculty Member"} • Faculty Portal
            </span>
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Peer Learning Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Credit-aware data ingestion, institutional guardrail compliance, and Scikit-Learn peer pairing.
          </p>

          {user?.teaching_courses && user.teaching_courses.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 animate-fade-in">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                Instructing:
              </span>
              {user.teaching_courses.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF6FF] dark:bg-blue-950/80 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-blue-900 shadow-xs"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => teacherApi.downloadSampleTemplate()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-[#EDF6FF] dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-[#CCE6FF] dark:border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0062FF]" />
            <span>Download Schema (.xlsx)</span>
          </button>

          <button
            onClick={() => teacherApi.exportPairingsCsv()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0062FF] via-[#0A7AFF] to-[#1A8CFF] hover:from-[#0047BA] hover:to-[#0062FF] text-white text-xs font-bold shadow-[0_0_20px_rgba(0,98,255,0.35)] transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Active Pairings</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-[#EDF6FF] dark:bg-slate-900/80 border border-[#CCE6FF] dark:border-slate-800 mb-8 max-w-md">
        <button
          onClick={() => setActiveTab("pairings")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pairings"
              ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          AI Pairings ({pairings.length})
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Excel & Data Ingestion
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "students"
              ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Students ({students.length})
        </button>
      </div>

      {/* TAB 1: AI PAIRINGS & MATCHING ENGINE */}
      {activeTab === "pairings" && (
        <div className="space-y-6">
          
          {/* AI Trigger Bar */}
          <div className="apple-card rounded-3xl p-5 sm:p-6 shadow-sm border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-[#0062FF]" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Execute AI Matching Pipeline
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-dimensional vectorization over FA1, FA2, SA, attendance, and technical certifications.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Subject Selector */}
                <div>
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectFilterChange(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#CCE6FF] dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}: {sub.name} ({sub.subject_type}, {sub.credits}cr)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Strategy Selector */}
                <div className="flex rounded-xl bg-[#EDF6FF] dark:bg-slate-900 p-1 border border-[#CCE6FF] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStrategy("complementary")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      strategy === "complementary"
                        ? "bg-white dark:bg-slate-800 text-[#0062FF] dark:text-[#38A6FF] shadow-sm font-bold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Complementary (Weak + Strong)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrategy("balanced")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      strategy === "balanced"
                        ? "bg-white dark:bg-slate-800 text-[#0062FF] dark:text-[#38A6FF] shadow-sm font-bold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Balanced (Peer Equivalence)
                  </button>
                </div>

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={handleRunMatching}
                  disabled={matchingLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0062FF] via-[#0A7AFF] to-[#1A8CFF] hover:from-[#0047BA] hover:to-[#0062FF] text-white text-xs font-bold shadow-[0_0_20px_rgba(0,98,255,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {matchingLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{matchingLoading ? "Computing Synergies..." : "Run Matching Engine"}</span>
                </button>
              </div>
            </div>

            {matchingSuccess && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{matchingSuccess}</span>
              </div>
            )}
          </div>

          {/* Pairings Cards Grid */}
          <div className="grid grid-cols-1 gap-6">
            {pairings.length === 0 ? (
              <div className="apple-card rounded-3xl p-12 text-center border">
                <BrainCircuit className="w-12 h-12 mx-auto text-[#99D1FF] dark:text-slate-700 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Active Pairings Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Upload an Excel batch or select a subject and run the Scikit-Learn AI Matching Engine above.
                </p>
              </div>
            ) : (
              pairings.map((p) => (
                <div key={p.id} className="apple-card rounded-3xl p-6 sm:p-7 border relative overflow-hidden group">
                  
                  {/* Subject and Score Header */}
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#CCE6FF] dark:border-slate-800 gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EDF6FF] dark:bg-blue-950/80 text-[#0062FF] dark:text-[#66BDFF] border border-[#CCE6FF] dark:border-blue-800">
                        {p.subject_code}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {p.subject_name}
                        </h3>
                        <p className="text-[11px] text-slate-400 capitalize">
                          Strategy: <span className="font-semibold text-slate-600 dark:text-slate-300">{p.strategy}</span>
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-[#EDF6FF] dark:bg-blue-950/60 border border-[#CCE6FF] dark:border-blue-800/60">
                      <Sparkles className="w-3.5 h-3.5 text-[#0062FF]" />
                      <span className="text-xs font-bold text-[#0062FF] dark:text-[#38A6FF]">
                        Synergy Score: {p.match_score}%
                      </span>
                    </div>
                  </div>

                  {/* Mentorship / Collaboration Pair Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                    
                    {/* Mentor Card */}
                    <div className="p-4 rounded-2xl bg-[#F6FAFF] dark:bg-slate-900/60 border border-[#CCE6FF]/80 dark:border-slate-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {p.strategy === "complementary" ? "Lead Mentor" : "Peer Colleague A"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                          {p.mentor.prn}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.mentor.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.mentor.email}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {p.mentor.department}
                      </p>
                    </div>

                    {/* Mentee Card */}
                    <div className="p-4 rounded-2xl bg-[#F6FAFF] dark:bg-slate-900/60 border border-[#CCE6FF]/80 dark:border-slate-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-[#38A6FF]">
                          {p.strategy === "complementary" ? "Mentee Learner" : "Peer Colleague B"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono font-bold">
                          {p.mentee.prn}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.mentee.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.mentee.email}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {p.mentee.department}
                      </p>
                    </div>
                  </div>

                  {/* AI Rationale */}
                  <div className="p-4 rounded-2xl bg-[#EDF6FF] dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-800 mb-5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0062FF] dark:text-[#38A6FF] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Rationale & Synergy Insight</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {p.ai_rationale}
                    </p>
                  </div>

                  {/* Micro-Project Recommender Preview */}
                  {p.recommended_project_title && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-[#CCE6FF] dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-[#38A6FF]">
                          Recommended Micro-Project
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {p.project_domain}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.recommended_project_title}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {p.project_description}
                      </p>
                      {p.project_tech_stack && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {p.project_tech_stack.split(",").map((tech, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF6FF] dark:bg-blue-950/60 text-[#0062FF] dark:text-[#66BDFF] font-medium border border-[#CCE6FF] dark:border-blue-900/50">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXCEL / CSV UPLOAD & DIRECT WEB SPREADSHEET */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          <div className="apple-card rounded-3xl p-6 sm:p-8 border shadow-sm">
            
            {/* Main Header & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#CCE6FF] dark:border-slate-800 gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Student Academic Records Ingestion
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  Choose your preferred entry method: directly fill and edit marks using the interactive web spreadsheet below, or upload an existing Excel (.xlsx) / CSV (.csv) file in the exact same format.
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="inline-flex p-1.5 rounded-2xl bg-[#EDF6FF] dark:bg-slate-900 border border-[#CCE6FF] dark:border-slate-800 self-start sm:self-auto shadow-sm">
                <button
                  type="button"
                  onClick={() => setIngestionMode("direct")}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ingestionMode === "direct"
                      ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Direct Web Spreadsheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIngestionMode("file")}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ingestionMode === "file"
                      ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File (.xlsx / .csv)</span>
                </button>
              </div>
            </div>

            {/* OPTION 1: INTERACTIVE WEB SPREADSHEET */}
            {ingestionMode === "direct" && (
              <InteractiveExcelGrid onIngestionSuccess={loadData} />
            )}

            {/* OPTION 2: FILE UPLOAD DROP ZONE */}
            {ingestionMode === "file" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Drag & Drop File Ingestion
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload .xlsx, .xls, or .csv files strictly adhering to PCCOE credit marks limits.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => teacherApi.downloadSampleTemplate()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EDF6FF] dark:bg-slate-800 text-[#0062FF] dark:text-[#38A6FF] text-xs font-semibold border border-[#CCE6FF] dark:border-slate-700 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template (.xlsx)</span>
                  </button>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? "border-[#0062FF] bg-[#EDF6FF] dark:bg-blue-950/30 scale-[1.01]"
                      : "border-[#CCE6FF] dark:border-slate-700 hover:border-[#0062FF] bg-[#F6FAFF] dark:bg-slate-900/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EDF6FF] dark:bg-blue-950/80 border border-[#CCE6FF] dark:border-blue-800 flex items-center justify-center text-[#0062FF] shadow-sm transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Drag and drop your Excel or CSV file here
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Supports .xlsx, .xls, and .csv with columns: Name, PRN, Email, Subject_Code, Subject_Type, Credits, FA1, FA2, SA, Attendance.
                  </p>

                  <button
                    type="button"
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-[#CCE6FF] dark:border-slate-700 shadow-sm"
                  >
                    Browse Files
                  </button>
                </div>

                {/* Upload Loading indicator */}
                {uploadLoading && (
                  <div className="p-4 rounded-2xl bg-[#EDF6FF] dark:bg-blue-950/40 border border-[#CCE6FF] dark:border-blue-800 text-center animate-pulse">
                    <p className="text-xs font-semibold text-[#0062FF] dark:text-[#38A6FF]">
                      Validating institutional domain & credit limits...
                    </p>
                  </div>
                )}

                {/* Error Banner */}
                {uploadError && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
                    <div>
                      <h4 className="font-bold">Ingestion Blocked</h4>
                      <p className="mt-0.5">{uploadError}</p>
                    </div>
                  </div>
                )}

                {/* Validation Guardrail Errors Drawer */}
                {uploadResult && !uploadResult.success && uploadResult.errors?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-red-50/90 dark:bg-red-950/40 border border-red-300 dark:border-red-900/80 animate-slide-up">
                    <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 mb-3">
                      <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="font-bold text-sm">
                        Credit-Aware Validation Guardrail Violations ({uploadResult.errors.length} issues)
                      </h3>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                      The upload was safely rejected. Please rectify the following row-level constraint violations in your file:
                    </p>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {uploadResult.errors.map((err, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/50 text-xs text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-[10px]">
                            Row {err.row}
                          </span>
                          <span className="flex-1 font-medium text-red-600 dark:text-red-400">
                            {err.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Success Notification */}
                {uploadResult && uploadResult.success && (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 animate-slide-up">
                    <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 mb-1">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-sm">Validation & Ingestion Successful</h3>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Processed {uploadResult.valid_rows_processed} rows successfully. Created {uploadResult.new_students_created} new student profiles, updated {uploadResult.records_updated} subject records.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: ENROLLED STUDENTS DIRECTORY */}
      {activeTab === "students" && (
        <div className="apple-card rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enrolled Student Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total {students.length} verified @pccoepune.org institutional profiles
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#CCE6FF] dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">PRN</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Institutional Email</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Enrolled Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCE6FF]/50 dark:divide-slate-800/60">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-[#EDF6FF]/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-[#0062FF] dark:text-[#38A6FF]">
                      {stu.prn}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                      {stu.name}
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">
                      {stu.email}
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">
                      {stu.department}
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {stu.records?.map((r) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#EDF6FF] dark:bg-slate-800 text-[#0062FF] dark:text-[#66BDFF] border border-[#CCE6FF] dark:border-slate-700"
                            title={`FA1: ${r.fa1}, FA2: ${r.fa2}, SA: ${r.sa}, Attendance: ${r.attendance_pct}%`}
                          >
                            {r.subject_code}: {r.total_marks}/{r.max_marks} ({r.attendance_pct}%)
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
}
