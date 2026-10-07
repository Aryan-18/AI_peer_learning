import React, { useState } from "react";
import { 
  BookOpen, Sparkles, SlidersHorizontal, CheckCircle2, 
  Layers, Award, Check, ChevronDown, RefreshCw, AlertCircle
} from "lucide-react";

export default function SemesterCurriculumCard({
  curriculum,
  onElectiveChange,
  onUpdateAcademicProfile,
  electiveLoading,
}) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(curriculum?.year || "Second Year (SY)");
  const [selectedSemester, setSelectedSemester] = useState(curriculum?.semester || "Semester III");
  const [selectedScheme, setSelectedScheme] = useState(curriculum?.scheme || "Scheme A");
  const [savingProfile, setSavingProfile] = useState(false);

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    if (newYear === "Second Year (SY)") {
      setSelectedSemester("Semester III");
    } else if (newYear === "Third Year (TY)") {
      setSelectedSemester("Semester V");
    } else if (newYear === "Final Year (B.Tech)") {
      setSelectedSemester("Semester VII");
      if (!selectedScheme) setSelectedScheme("Scheme A");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await onUpdateAcademicProfile({
        year: selectedYear,
        semester: selectedSemester,
        scheme: selectedYear === "Final Year (B.Tech)" ? selectedScheme : null,
      });
      setIsSwitcherOpen(false);
    } catch (err) {
      alert("Failed to update semester curriculum: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const subjects = curriculum?.subjects || [];
  const totalCredits = curriculum?.total_credits || subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
  const totalMaxMarks = curriculum?.total_max_marks || subjects.reduce((sum, s) => sum + (s.max_marks || 0), 0);

  return (
    <div className="apple-card rounded-3xl p-6 sm:p-8 mb-8 border relative overflow-hidden shadow-sm">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[#CCE6FF] dark:border-[#0062FF]/20 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#0062FF] dark:text-[#38A6FF] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Enrolled Semester Curriculum</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Subjects for {curriculum?.semester}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {curriculum?.year}
            {curriculum?.scheme && (
              <>
                {" • "}
                <span className="font-bold text-[#0062FF] dark:text-[#38A6FF]">
                  {curriculum.scheme}
                </span>
              </>
            )}
            {" • "}
            Institutional Curriculum (Open Electives & MDM Excluded)
          </p>
        </div>

        {/* Quick Summary Badges & Switcher Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#0B1222]/90 border border-[#CCE6FF] dark:border-[#0062FF]/30 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Courses
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {subjects.length}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#0B1222]/90 border border-[#CCE6FF] dark:border-[#0062FF]/30 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Credits
            </span>
            <span className="text-sm font-extrabold text-[#0062FF] dark:text-[#38A6FF]">
              {totalCredits} cr
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#0B1222]/90 border border-[#CCE6FF] dark:border-[#0062FF]/30 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Max Marks
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalMaxMarks}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedYear(curriculum?.year || "Second Year (SY)");
              setSelectedSemester(curriculum?.semester || "Semester III");
              setSelectedScheme(curriculum?.scheme || "Scheme A");
              setIsSwitcherOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-[#EDF6FF] dark:bg-[#0062FF]/15 hover:bg-[#CCE6FF]/50 dark:hover:bg-[#0062FF]/25 border border-[#CCE6FF] dark:border-[#0062FF]/30 text-[#0062FF] dark:text-[#38A6FF] text-xs font-bold transition-all cursor-pointer shadow-sm ml-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Switch Semester / Scheme</span>
          </button>
        </div>
      </div>

      {/* Curriculum Table for Large Screens */}
      <div className="mt-6 overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#CCE6FF]/70 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-3 px-3">Course Code</th>
              <th className="py-3 px-4">Course Name</th>
              <th className="py-3 px-3 text-center">Type</th>
              <th className="py-3 px-3 text-right">Credits</th>
              <th className="py-3 px-3 text-right">Maximum Marks</th>
              <th className="py-3 px-4 text-center">Status / Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCE6FF]/40 dark:divide-slate-800/60 text-xs">
            {subjects.map((sub, idx) => {
              const rec = sub.current_record;
              const hasMarks = rec && rec.total_marks > 0;
              const marksPct = hasMarks ? Math.round((rec.total_marks / sub.max_marks) * 100) : null;

              return (
                <tr
                  key={`${sub.code}-${idx}`}
                  className="hover:bg-[#EDF6FF]/40 dark:hover:bg-[#0062FF]/5 transition-colors group"
                >
                  {/* Course Code */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono font-extrabold px-2.5 py-1 rounded-xl bg-white dark:bg-[#0B1426] text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-[#0062FF]/30 shadow-xs">
                      {sub.code}
                    </span>
                  </td>

                  {/* Course Name + Elective Dropdown if variable */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {sub.name}
                        </span>
                        {sub.is_elective && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Elective Choice</span>
                          </span>
                        )}
                      </div>

                      {/* Dropdown for Programme Electives */}
                      {sub.is_elective && sub.available_options && (
                        <div className="mt-1.5 flex items-center space-x-2">
                          <label className="text-[10px] font-semibold text-slate-400">
                            Select Option:
                          </label>
                          <select
                            value={sub.selected_option_code || sub.code}
                            onChange={(e) => onElectiveChange(sub.elective_group, e.target.value)}
                            disabled={electiveLoading === sub.elective_group}
                            className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-[#080E1E] border border-[#CCE6FF] dark:border-[#0062FF]/40 text-[#0062FF] dark:text-[#38A6FF] font-semibold outline-none focus:ring-2 focus:ring-[#0062FF]/20 cursor-pointer shadow-xs disabled:opacity-60"
                          >
                            {sub.available_options.map((opt) => (
                              <option key={opt.code} value={opt.code}>
                                {opt.code} • {opt.name} ({opt.credits} cr • Max {opt.max_marks})
                              </option>
                            ))}
                          </select>
                          {electiveLoading === sub.elective_group && (
                            <RefreshCw className="w-3.5 h-3.5 text-[#0062FF] animate-spin" />
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Subject Type */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                      sub.subject_type === "Lab"
                        ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60"
                        : sub.subject_type === "Project"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                        : "bg-[#EDF6FF] dark:bg-[#0062FF]/10 text-slate-700 dark:text-slate-300 border border-[#CCE6FF] dark:border-[#0062FF]/20"
                    }`}>
                      {sub.subject_type}
                    </span>
                  </td>

                  {/* Credits */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-extrabold text-slate-900 dark:text-white">
                    {sub.credits}
                  </td>

                  {/* Maximum Marks */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-extrabold text-emerald-600 dark:text-emerald-400">
                    {sub.max_marks}
                  </td>

                  {/* Performance / Marks */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {hasMarks ? (
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                          <span className="text-[#0062FF] dark:text-[#38A6FF]">{rec.total_marks}</span>
                          <span className="text-slate-400">/</span>
                          <span>{sub.max_marks}</span>
                          <span className="text-[10px] text-emerald-500 font-bold ml-1">({marksPct}%)</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1">
                          <div 
                            className="h-full bg-gradient-to-r from-[#0062FF] to-[#38A6FF] rounded-full"
                            style={{ width: `${Math.min(marksPct || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3 h-3 text-[#0062FF]" />
                        <span>Compulsory Enrolled</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive Cards for Mobile Screens */}
      <div className="mt-6 space-y-3.5 md:hidden">
        {subjects.map((sub, idx) => {
          const rec = sub.current_record;
          const hasMarks = rec && rec.total_marks > 0;

          return (
            <div
              key={`${sub.code}-${idx}`}
              className="p-4 rounded-2xl bg-white/80 dark:bg-[#0B1222]/80 border border-[#CCE6FF] dark:border-[#0062FF]/20 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-xl bg-[#EDF6FF] dark:bg-[#0062FF]/20 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-[#0062FF]/30">
                  {sub.code}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  {sub.subject_type}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {sub.name}
                </h4>
                {sub.is_elective && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200">
                    Programme Elective
                  </span>
                )}
              </div>

              {/* Mobile Elective Selector */}
              {sub.is_elective && sub.available_options && (
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Select Elective Option:
                  </label>
                  <select
                    value={sub.selected_option_code || sub.code}
                    onChange={(e) => onElectiveChange(sub.elective_group, e.target.value)}
                    disabled={electiveLoading === sub.elective_group}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#080E1E] border border-[#CCE6FF] dark:border-[#0062FF]/40 text-[#0062FF] dark:text-[#38A6FF] font-semibold outline-none"
                  >
                    {sub.available_options.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code}: {opt.name} ({opt.credits} cr • Max {opt.max_marks})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Credits: </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{sub.credits}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Maximum Marks: </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{sub.max_marks}</span>
                </div>
              </div>

              {hasMarks && (
                <div className="text-xs pt-1 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Current Score:</span>
                  <span className="font-bold text-[#0062FF] dark:text-[#38A6FF]">
                    {rec.total_marks} / {sub.max_marks}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Switch Semester / Scheme Modal */}
      {isSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="apple-card w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl relative bg-white dark:bg-[#080E1E]">
            <div className="flex items-center space-x-2 text-[#0062FF] dark:text-[#38A6FF] mb-2 font-bold text-xs uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Academic Curriculum Configuration</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Switch Semester / Curriculum Scheme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Select your academic year and semester. Compulsory subjects load automatically; Open Elective & MDM courses are excluded.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
                >
                  <option value="Second Year (SY)">Second Year (SY)</option>
                  <option value="Third Year (TY)">Third Year (TY)</option>
                  <option value="Final Year (B.Tech)">Final Year (B.Tech)</option>
                </select>
              </div>

              {/* Scheme for Final Year */}
              {selectedYear === "Final Year (B.Tech)" && (
                <div className="p-3 rounded-2xl bg-[#EDF6FF] dark:bg-[#0062FF]/10 border border-[#CCE6FF] dark:border-[#0062FF]/30">
                  <label className="block text-xs font-bold text-[#0062FF] dark:text-[#38A6FF] mb-1.5">
                    Final Year Curriculum Scheme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedScheme("Scheme A")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedScheme === "Scheme A"
                          ? "bg-[#0062FF] text-white border-[#0062FF] shadow-xs"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CCE6FF] dark:border-slate-700"
                      }`}
                    >
                      Scheme A
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedScheme("Scheme B")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedScheme === "Scheme B"
                          ? "bg-[#0062FF] text-white border-[#0062FF] shadow-xs"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CCE6FF] dark:border-slate-700"
                      }`}
                    >
                      Scheme B
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Loads Scheme A or Scheme B subjects strictly as defined in PCCOE curriculum.
                  </p>
                </div>
              )}

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enrolled Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/70 border border-[#CCE6FF] dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
                >
                  {selectedYear === "Second Year (SY)" && (
                    <>
                      <option value="Semester III">Semester III</option>
                      <option value="Semester IV">Semester IV</option>
                    </>
                  )}
                  {selectedYear === "Third Year (TY)" && (
                    <>
                      <option value="Semester V">Semester V</option>
                      <option value="Semester VI">Semester VI</option>
                    </>
                  )}
                  {selectedYear === "Final Year (B.Tech)" && (
                    <>
                      <option value="Semester VII">Semester VII</option>
                      <option value="Semester VIII">Semester VIII</option>
                    </>
                  )}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSwitcherOpen(false)}
                  className="w-1/2 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-1/2 py-2.5 rounded-2xl bg-gradient-to-r from-[#0062FF] to-[#0A7AFF] hover:from-[#0047BA] hover:to-[#0062FF] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {savingProfile ? "Updating..." : "Save & Load"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
