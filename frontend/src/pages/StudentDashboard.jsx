import React, { useState, useEffect } from "react";
import { 
  Sparkles, Users, Award, BookOpen, CheckCircle2, Clock, Mail, 
  ExternalLink, GraduationCap, ChevronRight, BarChart2, Check, ArrowUpRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { studentApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import UserProfileModal from "../components/UserProfileModal";
import SemesterCurriculumCard from "../components/SemesterCurriculumCard";

export default function StudentDashboard() {
  const { user, avatar } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPairingId, setSelectedPairingId] = useState(null);
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [electiveLoading, setElectiveLoading] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getDashboard();
      setData(res);
      if (res.pairings && res.pairings.length > 0) {
        setSelectedPairingId(res.pairings[0].pairing_id);
      }
    } catch (err) {
      console.error("Failed to load student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleElectiveChange = async (electiveGroup, newCourseCode) => {
    setElectiveLoading(electiveGroup);
    try {
      const updated = await studentApi.selectElective(electiveGroup, newCourseCode);
      setData(updated);
    } catch (err) {
      alert("Failed to update elective choice: " + err.message);
    } finally {
      setElectiveLoading(null);
    }
  };

  const handleUpdateAcademicProfile = async (payload) => {
    const updated = await studentApi.updateAcademicProfile(payload);
    setData(updated);
  };

  const handleMilestoneToggle = async (pairingId, index, currentStatus) => {
    setMilestoneLoading(true);
    try {
      const res = await studentApi.updateMilestone(pairingId, index, !currentStatus);
      if (res.success) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedPairings = prev.pairings.map((p) => {
            if (p.pairing_id === pairingId) {
              const updatedMilestones = [...p.project.milestones];
              updatedMilestones[index].completed = !currentStatus;
              
              const allDone = updatedMilestones.every((m) => m.completed);
              if (allDone) {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }

              return {
                ...p,
                project: {
                  ...p.project,
                  milestones: updatedMilestones,
                },
              };
            }
            return p;
          });
          return { ...prev, pairings: updatedPairings };
        });
      }
    } catch (err) {
      alert("Milestone update error: " + err.message);
    } finally {
      setMilestoneLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0062FF]/30 border-t-[#0062FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPairing = data?.pairings?.find((p) => p.pairing_id === selectedPairingId) || data?.pairings?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="apple-card rounded-3xl p-6 sm:p-8 mb-8 border relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                  alt="Student Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0062FF] dark:group-hover:text-[#38A6FF] transition-colors">
                {data?.student?.name || user?.full_name || "Student Scholar"} • Student Portal
              </span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {data?.student?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              PRN: <span className="font-mono font-bold text-[#0062FF] dark:text-[#38A6FF]">{data?.student?.prn}</span> • {data?.student?.department}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EDF6FF] dark:bg-[#0062FF]/15 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-[#0062FF]/30">
                {data?.curriculum?.year || data?.student?.year}
              </span>
              {data?.curriculum?.scheme && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  {data?.curriculum?.scheme}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {data?.curriculum?.semester || data?.student?.semester}
              </span>
            </div>
          </div>

          {/* Quick Enrolled Stats */}
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20 text-center min-w-[70px]">
              <span className="block text-xl font-extrabold text-slate-900 dark:text-white">
                {data?.curriculum?.subjects?.length || data?.academic_records?.length || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Courses
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20 text-center min-w-[70px]">
              <span className="block text-xl font-extrabold text-[#0062FF] dark:text-[#38A6FF]">
                {data?.curriculum?.total_credits || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Credits
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20 text-center min-w-[70px]">
              <span className="block text-xl font-extrabold text-[#0062FF] dark:text-[#38A6FF]">
                {data?.pairings?.length || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Peer Pairs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Semester-Wise Curriculum Section */}
      {data?.curriculum && (
        <SemesterCurriculumCard
          curriculum={data.curriculum}
          onElectiveChange={handleElectiveChange}
          onUpdateAcademicProfile={handleUpdateAcademicProfile}
          electiveLoading={electiveLoading}
        />
      )}

      {/* Main Grid: Pair Info & Micro-Project Roadmap */}
      {!currentPairing ? (
        <div className="apple-card rounded-3xl p-12 text-center border">
          <Users className="w-12 h-12 mx-auto text-[#99D1FF] dark:text-[#0062FF]/50 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Active Peer Pairing Assigned Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Your instructor will run the AI Peer-Matching engine shortly based on recent formative assessments and attendance records.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Pairing Selector Tabs */}
          {data?.pairings?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {data.pairings.map((p) => (
                <button
                  key={p.pairing_id}
                  onClick={() => setSelectedPairingId(p.pairing_id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedPairingId === p.pairing_id
                      ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white border-[#0062FF] shadow-[0_0_20px_rgba(0,98,255,0.35)]"
                      : "bg-white dark:bg-[#0B1222] text-slate-600 dark:text-slate-300 border-[#CCE6FF] dark:border-[#0062FF]/20 hover:border-[#99D1FF]"
                  }`}
                >
                  {p.subject_code}: {p.subject_name}
                </button>
              ))}
            </div>
          )}

          {/* Partner Information Card (Reference Blue & White Apple-style card) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Peer Card */}
            <div className="apple-card rounded-3xl p-6 sm:p-7 border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#CCE6FF]/40 dark:bg-[#0062FF]/20 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-[#0062FF]/30">
                    {currentPairing.subject_code}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#0062FF] dark:text-[#38A6FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentPairing.match_score}% Match</span>
                  </div>
                </div>

                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#0062FF] via-[#0A7AFF] to-[#38A6FF] flex items-center justify-center text-white text-xl font-extrabold shadow-[0_0_25px_rgba(0,98,255,0.35)] mb-3">
                    {currentPairing.peer.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentPairing.peer.name}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#0062FF] dark:text-[#38A6FF] mt-0.5">
                    {currentPairing.peer.prn}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentPairing.peer.email}
                  </p>
                  <div className="mt-2.5 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDF6FF] dark:bg-[#0062FF]/10 text-slate-700 dark:text-slate-300 border border-[#CCE6FF] dark:border-[#0062FF]/30">
                    Assigned Role: <strong className="ml-1 text-[#0062FF] dark:text-[#38A6FF]">{currentPairing.peer.role_in_pair}</strong>
                  </div>
                </div>
              </div>

              {/* Action Button: Email Peer */}
              <div className="pt-4 border-t border-[#CCE6FF] dark:border-[#0062FF]/20">
                <a
                  href={`mailto:${currentPairing.peer.email}?subject=PCCOE Peer Learning Collaboration: ${currentPairing.subject_name}&body=${encodeURIComponent(currentPairing.collaboration_prompt || "")}`}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0062FF] via-[#0A7AFF] to-[#0062FF] hover:from-[#0047BA] hover:to-[#0A7AFF] text-white font-semibold text-xs shadow-[0_0_25px_rgba(0,98,255,0.35)] transition-all flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Connect with Peer</span>
                </a>
              </div>
            </div>

            {/* Middle Col: AI Match Rationale & Icebreaker */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Rationale Card */}
              <div className="apple-card rounded-3xl p-6 border">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#0062FF] dark:text-[#38A6FF] mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Match Rationale & Guidance</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Why this partnership was formed:
                </h4>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {currentPairing.ai_rationale}
                </p>

                {currentPairing.collaboration_prompt && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#EDF6FF]/70 dark:bg-[#0062FF]/10 border border-[#CCE6FF] dark:border-[#0062FF]/30">
                    <p className="text-[11px] font-semibold text-[#0062FF] dark:text-[#38A6FF] uppercase tracking-wider mb-1">
                      Suggested Icebreaker / Conversation Starter:
                    </p>
                    <p className="text-xs italic text-slate-700 dark:text-slate-300">
                      "{currentPairing.collaboration_prompt}"
                    </p>
                  </div>
                )}
              </div>

              {/* Skill Synergy Comparison */}
              <div className="apple-card rounded-3xl p-6 border">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white mb-4">
                  <BarChart2 className="w-4 h-4 text-[#0062FF] dark:text-[#38A6FF]" />
                  <span>Synergy Breakdown ({currentPairing.subject_code})</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Course Marks
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      You: <span className="text-[#0062FF] dark:text-[#38A6FF]">{currentPairing.comparison.my_marks}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      Peer: {currentPairing.comparison.peer_marks}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Attendance
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      You: <span className="text-[#0062FF] dark:text-[#38A6FF]">{currentPairing.comparison.my_attendance}%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      Peer: {currentPairing.comparison.peer_attendance}%
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Technical Certs
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      You: <span className="text-[#0062FF] dark:text-[#38A6FF]">{currentPairing.comparison.my_certs}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      Peer: {currentPairing.comparison.peer_certs}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Micro-Project Roadmap & Actionable Milestones */}
          {currentPairing.project && (
            <div className="apple-card rounded-3xl p-6 sm:p-8 border shadow-sm">
              
              {/* Project Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[#CCE6FF] dark:border-[#0062FF]/20 gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-[#38A6FF] mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>AI-Recommended Micro-Project Roadmap</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {currentPairing.project.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    {currentPairing.project.description}
                  </p>
                </div>

                {/* Tech Stack Badges */}
                {currentPairing.project.tech_stack && (
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {currentPairing.project.tech_stack.split(",").map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#EDF6FF] dark:bg-[#0062FF]/20 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-[#0062FF]/30"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 4-Phase Interactive Timeline Milestones */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Phase-Wise Project Milestones
                  </h4>
                  <span className="text-xs font-bold text-[#0062FF] dark:text-[#38A6FF]">
                    {currentPairing.project.milestones.filter((m) => m.completed).length} of {currentPairing.project.milestones.length} Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPairing.project.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleMilestoneToggle(currentPairing.pairing_id, idx, milestone.completed)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${
                        milestone.completed
                          ? "bg-[#EDF6FF]/70 dark:bg-[#0062FF]/15 border-[#99D1FF] dark:border-[#0062FF]/40"
                          : "bg-white dark:bg-[#0B1222]/80 border-[#CCE6FF] dark:border-[#0062FF]/20 hover:border-[#99D1FF]"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            milestone.completed
                              ? "bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] text-white shadow-sm"
                              : "border-2 border-slate-300 dark:border-slate-700 text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        {/* Milestone details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Phase {milestone.phase}
                            </span>
                            {milestone.completed && (
                              <span className="text-[10px] font-bold text-[#0062FF] dark:text-[#38A6FF]">
                                Completed
                              </span>
                            )}
                          </div>
                          <h5 className={`text-sm font-bold mt-0.5 ${milestone.completed ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                            {milestone.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {milestone.description}
                          </p>
                          <div className="mt-2 text-[10px] font-semibold text-[#0062FF] dark:text-[#38A6FF] bg-[#EDF6FF] dark:bg-[#0062FF]/20 px-2 py-1 rounded-md inline-block border border-[#CCE6FF] dark:border-[#0062FF]/30">
                            Deliverable: {milestone.deliverable}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

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
