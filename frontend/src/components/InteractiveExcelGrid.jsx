import React, { useState } from "react";
import { 
  Plus, Trash2, CheckCircle2, AlertTriangle, Download, 
  Sparkles, RotateCcw, Save, ShieldAlert, FileSpreadsheet,
  ArrowRight, Info
} from "lucide-react";
import { teacherApi } from "../services/api";

export const createEmptyRow = () => ({
  name: "",
  prn: "",
  email: "",
  subject_code: "",
  subject_name: "",
  subject_type: "Theory",
  credits: 3,
  fa1: "",
  fa2: "",
  sa: "",
  attendance: "",
  certs_count: "",
  external_courses: ""
});

export function getMaxCap(type, credits) {
  const cred = Number(credits) || 3;
  if (type === "Lab") {
    if (cred === 1) return 25;
    if (cred === 2) return 50;
    return 100;
  }
  // Theory
  if (cred === 2) return 50;
  return 100;
}

export default function InteractiveExcelGrid({ onIngestionSuccess }) {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCellChange = (index, field, value) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => {
      const remaining = prev.filter((_, i) => i !== index);
      return remaining.length > 0 ? remaining : [createEmptyRow()];
    });
  };

  const handleResetToEmpty = () => {
    setRows([createEmptyRow()]);
    setResult(null);
    setErrorMsg("");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear the spreadsheet?")) {
      setRows([createEmptyRow()]);
      setResult(null);
      setErrorMsg("");
    }
  };

  const handleExportCSV = () => {
    const activeRows = rows.filter(r => 
      r.name?.trim() || r.prn?.trim() || r.email?.trim() || r.subject_code?.trim()
    );
    if (activeRows.length === 0) {
      alert("No student records to export. Please enter student details first.");
      return;
    }
    const headers = [
      "Name", "PRN", "Email", "Subject_Code", "Subject_Name", 
      "Subject_Type", "Credits", "FA1", "FA2", "SA", 
      "Attendance", "Certifications_Count", "External_Courses"
    ];

    const csvContent = [
      headers.join(","),
      ...activeRows.map(r => [
        `"${(r.name || "").replace(/"/g, '""')}"`,
        `"${(r.prn || "").replace(/"/g, '""')}"`,
        `"${(r.email || "").replace(/"/g, '""')}"`,
        `"${(r.subject_code || "").replace(/"/g, '""')}"`,
        `"${(r.subject_name || "").replace(/"/g, '""')}"`,
        `"${r.subject_type || "Theory"}"`,
        r.credits || 3,
        r.fa1 !== "" && r.fa1 !== undefined ? r.fa1 : 0,
        r.fa2 !== "" && r.fa2 !== undefined ? r.fa2 : 0,
        r.sa !== "" && r.sa !== undefined ? r.sa : 0,
        r.attendance !== "" && r.attendance !== undefined ? r.attendance : 85.0,
        r.certs_count !== "" && r.certs_count !== undefined ? r.certs_count : 0,
        `"${(r.external_courses || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pccoe_student_records_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    setResult(null);
    setErrorMsg("");

    const activeRows = rows.filter(r => 
      r.name?.trim() || r.prn?.trim() || r.email?.trim() || r.subject_code?.trim()
    );

    if (activeRows.length === 0) {
      setErrorMsg("Spreadsheet is empty. Please enter student details before saving.");
      return;
    }

    // Client-side quick check
    const clientErrors = [];
    activeRows.forEach((r, idx) => {
      const rowNum = idx + 1;
      const cleanEmail = (r.email || "").trim().toLowerCase();
      if (!r.name?.trim()) clientErrors.push(`Row ${rowNum}: Student Name is required.`);
      if (!r.prn?.trim()) clientErrors.push(`Row ${rowNum}: PRN is required.`);
      if (!r.subject_code?.trim()) clientErrors.push(`Row ${rowNum}: Subject Code is required.`);
      if (!cleanEmail.endsWith("@pccoepune.org")) {
        clientErrors.push(`Row ${rowNum}: Email '${r.email || ""}' must strictly end with @pccoepune.org`);
      }
      const total = Number(r.fa1 || 0) + Number(r.fa2 || 0) + Number(r.sa || 0);
      const cap = getMaxCap(r.subject_type, r.credits);
      if (total > cap) {
        clientErrors.push(`Row ${rowNum}: Total marks (${total}) exceeds ${r.subject_type} ${r.credits}-credit maximum cap of ${cap}.`);
      }
    });

    if (clientErrors.length > 0) {
      setResult({
        success: false,
        total_rows: activeRows.length,
        errors: clientErrors.map((msg, i) => ({ row: i + 1, error: msg }))
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = activeRows.map(r => ({
        name: r.name.trim(),
        prn: r.prn.trim().toUpperCase(),
        email: r.email.trim().toLowerCase(),
        subject_code: r.subject_code.trim().toUpperCase(),
        subject_name: (r.subject_name || r.subject_code).trim(),
        subject_type: r.subject_type || "Theory",
        credits: parseInt(r.credits) || 3,
        fa1: parseFloat(r.fa1) || 0.0,
        fa2: parseFloat(r.fa2) || 0.0,
        sa: parseFloat(r.sa) || 0.0,
        attendance: r.attendance !== "" && r.attendance !== undefined ? parseFloat(r.attendance) : 85.0,
        certs_count: parseInt(r.certs_count) || 0,
        external_courses: (r.external_courses || "").trim()
      }));

      const res = await teacherApi.directFillRecords(payload);
      setResult(res);
      if (res.success) {
        if (onIngestionSuccess) {
          onIngestionSuccess();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit student records.");
    } finally {
      setSubmitting(false);
    }
  };

  // Live row validation check helper
  const isRowExceedingCap = (row) => {
    const total = Number(row.fa1 || 0) + Number(row.fa2 || 0) + Number(row.sa || 0);
    const cap = getMaxCap(row.subject_type, row.credits);
    return total > cap;
  };

  const isRowEmailInvalid = (row) => {
    const email = (row.email || "").trim().toLowerCase();
    return email.length > 0 && !email.endsWith("@pccoepune.org");
  };

  return (
    <div className="space-y-6">
      
      {/* Spreadsheet Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#CCE6FF] dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#EDF6FF] dark:bg-blue-950/80 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-blue-800">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Live Web Spreadsheet Editor
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF6FF] dark:bg-slate-800 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-slate-700">
              {rows.length} {rows.length === 1 ? "Record" : "Records"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directly enter or edit student performance marks. Theory & Lab marks limits and @pccoepune.org institutional verification are computed in real time.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#0062FF] dark:hover:text-[#38A6FF] border border-[#CCE6FF] dark:border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Add a new blank row at bottom"
          >
            <Plus className="w-3.5 h-3.5 text-[#0062FF]" />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={handleResetToEmpty}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#0062FF] dark:hover:text-[#38A6FF] border border-[#CCE6FF] dark:border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Reset to 1 blank row"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Grid</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#0062FF] dark:hover:text-[#38A6FF] border border-[#CCE6FF] dark:border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Download currently entered data as CSV/Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Clear all rows"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rows.length === 0}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0062FF] via-[#0A7AFF] to-[#1A8CFF] hover:from-[#0047BA] hover:to-[#0062FF] text-white text-xs font-bold shadow-[0_0_20px_rgba(0,98,255,0.35)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{submitting ? "Ingesting Records..." : `Save & Ingest (${rows.length})`}</span>
          </button>
        </div>
      </div>

      {/* Credit Guardrail Quick Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#F6FAFF] dark:bg-slate-900/60 border border-[#CCE6FF]/80 dark:border-slate-800 text-[11px]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0062FF]"></span>
          <span className="text-slate-600 dark:text-slate-400">Theory 3-Credit:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">Max 100</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0A7AFF]"></span>
          <span className="text-slate-600 dark:text-slate-400">Theory 2-Credit:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">Max 50</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600 dark:text-slate-400">Lab 2-Credit:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">Max 50</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 dark:text-slate-400">Lab 1-Credit:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">Max 25</span>
        </div>
      </div>

      {/* General Submission Error */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2.5 animate-slide-up">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Validation Failures / Diagnostics Drawer */}
      {result && !result.success && result.errors?.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50/90 dark:bg-red-950/40 border border-red-300 dark:border-red-900/80 animate-slide-up">
          <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <h4 className="font-bold text-xs">
              Validation Blocked: {result.errors.length} constraint {result.errors.length === 1 ? "violation" : "violations"} found
            </h4>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {result.errors.map((err, i) => (
              <div key={i} className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/50 text-[11px] flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-[10px]">
                  Row {err.row}
                </span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {err.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Banner */}
      {result && result.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 animate-slide-up flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs">Spreadsheet Ingestion Successful!</h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
              Processed {result.valid_rows_processed} rows. Created {result.new_students_created} new student profiles, updated {result.records_updated} subject performance records.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Data Grid Table */}
      <div className="border border-[#CCE6FF] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        <div className="overflow-x-auto max-h-[540px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-[#EDF6FF] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-[#CCE6FF] dark:border-slate-700 shadow-sm">
              <tr>
                <th className="py-3 px-2 text-center w-10">#</th>
                <th className="py-3 px-3 min-w-[150px]">Student Name *</th>
                <th className="py-3 px-3 min-w-[110px]">PRN *</th>
                <th className="py-3 px-3 min-w-[190px]">Institutional Email *</th>
                <th className="py-3 px-3 min-w-[110px]">Subject Code *</th>
                <th className="py-3 px-3 min-w-[150px]">Subject Name</th>
                <th className="py-3 px-3 w-28">Type *</th>
                <th className="py-3 px-3 w-20">Credits *</th>
                <th className="py-3 px-2 w-16 text-center">FA1</th>
                <th className="py-3 px-2 w-16 text-center">FA2</th>
                <th className="py-3 px-2 w-16 text-center">SA</th>
                <th className="py-3 px-3 w-28 text-center">Total / Cap</th>
                <th className="py-3 px-2 w-20 text-center">Attend %</th>
                <th className="py-3 px-2 w-16 text-center">Certs</th>
                <th className="py-3 px-3 min-w-[150px]">External Courses</th>
                <th className="py-3 px-2 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CCE6FF]/60 dark:divide-slate-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="16" className="py-12 text-center text-slate-400">
                    No student records in spreadsheet. Click <strong>"Add Row"</strong> or <strong>"Load Template"</strong> to begin.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const totalMarks = Number(row.fa1 || 0) + Number(row.fa2 || 0) + Number(row.sa || 0);
                  const maxCap = getMaxCap(row.subject_type, row.credits);
                  const isCapExceeded = totalMarks > maxCap;
                  const isEmailInvalid = isRowEmailInvalid(row);

                  return (
                    <tr 
                      key={idx} 
                      className={`hover:bg-[#F6FAFF] dark:hover:bg-slate-800/40 transition-colors ${
                        isCapExceeded || isEmailInvalid ? "bg-red-50/40 dark:bg-red-950/20" : ""
                      }`}
                    >
                      {/* Row Index Badge */}
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Student Name */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleCellChange(idx, "name", e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* PRN */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.prn}
                          onChange={(e) => handleCellChange(idx, "prn", e.target.value.toUpperCase())}
                          placeholder="124B1C001"
                          className="w-full px-2.5 py-1.5 rounded-lg font-mono font-bold border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* Institutional Email */}
                      <td className="py-2 px-2">
                        <div className="relative">
                          <input
                            type="email"
                            value={row.email}
                            onChange={(e) => handleCellChange(idx, "email", e.target.value)}
                            placeholder="user@pccoepune.org"
                            className={`w-full px-2.5 py-1.5 rounded-lg border ${
                              isEmailInvalid
                                ? "border-red-400 focus:ring-red-400 text-red-600 bg-red-50/60 dark:bg-red-950/40"
                                : "border-[#CCE6FF] dark:border-slate-700 text-slate-900 dark:text-white focus:ring-[#0062FF]"
                            } bg-white dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 text-[11px]`}
                          />
                        </div>
                      </td>

                      {/* Subject Code */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.subject_code}
                          onChange={(e) => handleCellChange(idx, "subject_code", e.target.value.toUpperCase())}
                          placeholder="BCS23PC02"
                          className="w-full px-2.5 py-1.5 rounded-lg font-mono font-semibold border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0062FF] dark:text-[#38A6FF] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* Subject Name */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.subject_name}
                          onChange={(e) => handleCellChange(idx, "subject_name", e.target.value)}
                          placeholder="Course Title"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* Type (Theory / Lab) */}
                      <td className="py-2 px-2">
                        <select
                          value={row.subject_type}
                          onChange={(e) => handleCellChange(idx, "subject_type", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        >
                          <option value="Theory">Theory</option>
                          <option value="Lab">Lab</option>
                        </select>
                      </td>

                      {/* Credits (1, 2, 3) */}
                      <td className="py-2 px-2">
                        <select
                          value={row.credits}
                          onChange={(e) => handleCellChange(idx, "credits", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        >
                          <option value={1}>1 Credit</option>
                          <option value={2}>2 Credits</option>
                          <option value={3}>3 Credits</option>
                        </select>
                      </td>

                      {/* FA1 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={row.fa1}
                          placeholder="0"
                          onChange={(e) => handleCellChange(idx, "fa1", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                          className="w-14 px-1.5 py-1.5 text-center rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* FA2 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={row.fa2}
                          placeholder="0"
                          onChange={(e) => handleCellChange(idx, "fa2", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                          className="w-14 px-1.5 py-1.5 text-center rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* SA */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={row.sa}
                          placeholder="0"
                          onChange={(e) => handleCellChange(idx, "sa", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                          className="w-14 px-1.5 py-1.5 text-center rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* Computed Total Marks vs Cap */}
                      <td className="py-2 px-2 text-center">
                        <span 
                          className={`inline-block px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                            isCapExceeded
                              ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 animate-pulse"
                              : "bg-[#EDF6FF] dark:bg-blue-950/60 text-[#0062FF] dark:text-[#38A6FF] border border-[#CCE6FF] dark:border-blue-900"
                          }`}
                          title={isCapExceeded ? `Exceeds max limit of ${maxCap}!` : "Within allowed limit"}
                        >
                          {totalMarks} / {maxCap}
                        </span>
                      </td>

                      {/* Attendance % */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={row.attendance}
                          placeholder="85"
                          onChange={(e) => handleCellChange(idx, "attendance", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1.5 text-center rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* Certifications Count */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={row.certs_count}
                          placeholder="0"
                          onChange={(e) => handleCellChange(idx, "certs_count", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                          className="w-12 px-1.5 py-1.5 text-center rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                        />
                      </td>

                      {/* External Courses */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.external_courses}
                          onChange={(e) => handleCellChange(idx, "external_courses", e.target.value)}
                          placeholder="e.g. AWS ML, NPTEL"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#CCE6FF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] text-[11px]"
                        />
                      </td>

                      {/* Delete Row Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete this row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helper Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#0062FF]" />
          <span>
            Pro tip: You can edit any cell directly, change Theory/Lab and Credits, or load the official PCCOE schema template anytime.
          </span>
        </div>
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          Showing {rows.length} {rows.length === 1 ? "row" : "rows"} ready for ingestion
        </div>
      </div>

    </div>
  );
}
