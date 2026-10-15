import React, { useState, useEffect } from "react";
import { BookOpen, Check, X, Search, Plus, Filter } from "lucide-react";
import { subjectApi } from "../services/api";

export const DEFAULT_FACULTY_COURSES = [
  // Second Year (SY)
  { label: "SY/Artificial Intelligence", year: "SY", type: "Theory" },
  { label: "SY/Machine Learning", year: "SY", type: "Theory" },
  { label: "SY/Data Structures & Algorithms", year: "SY", type: "Theory" },
  { label: "SY/Data Structures Lab", year: "SY", type: "Lab" },
  { label: "SY/Java Programming Lab", year: "SY", type: "Lab" },
  { label: "SY/Financial Modelling & AI", year: "SY", type: "Theory" },
  { label: "SY/Theory of Computation", year: "SY", type: "Theory" },
  { label: "SY/Database Management Systems", year: "SY", type: "Theory" },
  { label: "SY/DBMS Lab", year: "SY", type: "Lab" },
  { label: "SY/Advanced Data Structures Lab", year: "SY", type: "Lab" },
  { label: "SY/Full Stack Development-I", year: "SY", type: "Lab" },
  { label: "SY/Community Engineering Project", year: "SY", type: "Project" },

  // Third Year (TY)
  { label: "TY/Artificial Intelligence", year: "TY", type: "Theory" },
  { label: "TY/Artificial Intelligence Lab", year: "TY", type: "Lab" },
  { label: "TY/NLPLab", year: "TY", type: "Lab" },
  { label: "TY/Natural Language Processing", year: "TY", type: "Theory" },
  { label: "TY/Computer Networks", year: "TY", type: "Theory" },
  { label: "TY/Embedded AI Lab", year: "TY", type: "Lab" },
  { label: "TY/Information Security", year: "TY", type: "Theory" },
  { label: "TY/Information Security Lab", year: "TY", type: "Lab" },
  { label: "TY/Design & Analysis of Algorithms", year: "TY", type: "Theory" },
  { label: "TY/Computer Vision", year: "TY", type: "Theory" },
  { label: "TY/Deep Learning", year: "TY", type: "Theory" },
  { label: "TY/Computer Vision & Deep Learning Lab", year: "TY", type: "Lab" },
  { label: "TY/Cloud Computing", year: "TY", type: "Theory" },
  { label: "TY/Cloud Computing Lab", year: "TY", type: "Lab" },
  { label: "TY/Cyber Security & Digital Forensics", year: "TY", type: "Theory" },
  { label: "TY/Cyber Security Lab", year: "TY", type: "Lab" },
  { label: "TY/Blockchain Technology", year: "TY", type: "Theory" },
  { label: "TY/Blockchain Lab", year: "TY", type: "Lab" },
  { label: "TY/Quantum Computing", year: "TY", type: "Theory" },
  { label: "TY/Robotics & Intelligent Systems", year: "TY", type: "Theory" },
  { label: "TY/Augmented & Virtual Reality", year: "TY", type: "Theory" },
  { label: "TY/Full Stack Development-II", year: "TY", type: "Lab" },

  // Final Year
  { label: "Final Year/Soft Computing & Optimization Algorithms", year: "Final Year", type: "Theory" },
  { label: "Final Year/Big Data Analytics", year: "Final Year", type: "Theory" },
  { label: "Final Year/Soft Computing Lab", year: "Final Year", type: "Lab" },
  { label: "Final Year/Big Data Analytics Lab", year: "Final Year", type: "Lab" },
  { label: "Final Year/Generative AI & LLMs", year: "Final Year", type: "Theory" },
  { label: "Final Year/Generative AI & LLMs Lab", year: "Final Year", type: "Lab" },
  { label: "Final Year/Edge AI & IoT Systems", year: "Final Year", type: "Theory" },
  { label: "Final Year/Deep Reinforcement Learning", year: "Final Year", type: "Theory" },
  { label: "Final Year/Research Methodology", year: "Final Year", type: "Theory" },
  { label: "Final Year/Major Project", year: "Final Year", type: "Project" },
  { label: "Final Year/Internship - OJT", year: "Final Year", type: "Project" }
];

export default function FacultyCourseSelector({ selectedCourses = [], onChange }) {
  const [courses, setCourses] = useState(DEFAULT_FACULTY_COURSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [customInput, setCustomInput] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);

  useEffect(() => {
    let isMounted = true;
    subjectApi
      .getFacultyCourseOptions()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Merge with default courses to ensure no duplicates
          const seen = new Set();
          const merged = [];
          data.forEach((c) => {
            if (!seen.has(c.label)) {
              seen.add(c.label);
              merged.push({
                label: c.label,
                year: c.year || (c.label.startsWith("SY") ? "SY" : c.label.startsWith("TY") ? "TY" : "Final Year"),
                type: c.type || "Theory"
              });
            }
          });
          DEFAULT_FACULTY_COURSES.forEach((c) => {
            if (!seen.has(c.label)) {
              seen.add(c.label);
              merged.push(c);
            }
          });
          setCourses(merged);
        }
      })
      .catch(() => {
        // Fallback to default list silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleCourse = (courseLabel) => {
    if (selectedCourses.includes(courseLabel)) {
      onChange(selectedCourses.filter((c) => c !== courseLabel));
    } else {
      onChange([...selectedCourses, courseLabel]);
    }
  };

  const handleRemoveCourse = (courseLabel, e) => {
    e.stopPropagation();
    onChange(selectedCourses.filter((c) => c !== courseLabel));
  };

  const handleAddCustom = (e) => {
    e?.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    // Ensure format has a slash or default to SY/
    let formatted = trimmed;
    if (!formatted.includes("/")) {
      formatted = `TY/${formatted}`;
    }

    if (!selectedCourses.includes(formatted)) {
      onChange([...selectedCourses, formatted]);
    }

    // Add to local options list if not present
    if (!courses.some((c) => c.label.toLowerCase() === formatted.toLowerCase())) {
      const yr = formatted.split("/")[0].trim().toUpperCase();
      setCourses((prev) => [
        { label: formatted, year: yr === "SY" ? "SY" : yr === "TY" ? "TY" : "Final Year", type: "Custom" },
        ...prev
      ]);
    }

    setCustomInput("");
    setShowAddCustom(false);
  };

  // Filter courses based on year and search term
  const filteredCourses = courses.filter((c) => {
    const matchesYear =
      yearFilter === "ALL" ||
      (yearFilter === "SY" && c.year === "SY") ||
      (yearFilter === "TY" && c.year === "TY") ||
      (yearFilter === "Final Year" && (c.year === "Final Year" || c.year === "B.Tech"));

    const matchesSearch =
      searchTerm.trim() === "" ||
      c.label.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-2.5 rounded-2xl bg-[#F6FAFF] dark:bg-slate-900/60 p-3 sm:p-4 border border-[#CCE6FF] dark:border-slate-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#0062FF] dark:text-[#38A6FF]" />
          <span>Courses You Teach</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        <span className="text-[11px] font-semibold text-[#0062FF] dark:text-[#38A6FF]">
          {selectedCourses.length} {selectedCourses.length === 1 ? "course" : "courses"} selected
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Select all subjects / laboratories you instruct in format <strong className="text-slate-700 dark:text-slate-200">Year/Course name</strong> (e.g. <span className="text-[#0062FF] dark:text-[#38A6FF] font-medium">SY/Artificial Intelligence</span>, <span className="text-[#0062FF] dark:text-[#38A6FF] font-medium">TY/NLPLab</span>).
      </p>

      {/* Selected Chips Display */}
      {selectedCourses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-[#CCE6FF] dark:border-slate-700/60 max-h-24 overflow-y-auto">
          {selectedCourses.map((c) => (
            <span
              key={c}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EDF6FF] dark:bg-blue-950/80 text-[#0062FF] dark:text-[#38A6FF] border border-[#B3D7FF] dark:border-blue-800/60 shadow-xs animate-fade-in"
            >
              <span>{c}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveCourse(c, e)}
                className="hover:text-red-500 rounded-full p-0.5 transition-colors cursor-pointer"
                title={`Remove ${c}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Year Filter Buttons & Search Input */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {["ALL", "SY", "TY", "Final Year"].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setYearFilter(yr)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                yearFilter === yr
                  ? "bg-[#0062FF] text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#CCE6FF] dark:border-slate-700 hover:text-[#0062FF]"
              }`}
            >
              {yr === "ALL" ? "All Years" : yr}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses (e.g. AI, NLP, Machine Learning, Lab)..."
            className="w-full pl-8 pr-8 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-[#CCE6FF] dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0062FF]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Course Selection List */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800/90 divide-y divide-slate-100 dark:divide-slate-700/50">
        {filteredCourses.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No courses found matching "{searchTerm}".
            <button
              type="button"
              onClick={() => {
                setShowAddCustom(true);
                setCustomInput(searchTerm);
              }}
              className="mt-1.5 block mx-auto text-[#0062FF] dark:text-[#38A6FF] font-bold hover:underline cursor-pointer"
            >
              + Add "{searchTerm}" as custom course
            </button>
          </div>
        ) : (
          filteredCourses.map((c) => {
            const isSelected = selectedCourses.includes(c.label);
            return (
              <div
                key={c.label}
                onClick={() => handleToggleCourse(c.label)}
                className={`flex items-center justify-between p-2 sm:px-3 text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#EDF6FF] dark:bg-[#0062FF]/20 text-[#0062FF] dark:text-[#38A6FF] font-bold"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isSelected
                        ? "bg-[#0062FF] border-[#0062FF] text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{c.label}</span>
                </div>
                {c.type && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ml-2 flex-shrink-0 ${
                      c.type === "Lab"
                        ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                        : c.type === "Project"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {c.type}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Custom Course Add Input */}
      {!showAddCustom ? (
        <button
          type="button"
          onClick={() => setShowAddCustom(true)}
          className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#0062FF] dark:text-[#38A6FF] hover:underline cursor-pointer pt-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Course Name</span>
        </button>
      ) : (
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CCE6FF] dark:border-slate-700 animate-slide-up space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Add Custom Course (Year/Course name)
            </span>
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. SY/Artificial Intelligence or TY/NLPLab"
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-[#0062FF]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#0062FF] text-white text-xs font-bold hover:bg-[#0047BA] disabled:opacity-50 transition-all cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
