const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("pccoe_token");
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // If /api proxy failed or is not available, fallback to direct 127.0.0.1:8000
    if (API_BASE_URL === "/api") {
      try {
        response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
          ...options,
          headers,
        });
      } catch (fallbackErr) {
        throw new Error(
          "Backend server is not reachable. Please make sure the backend is running on http://127.0.0.1:8000 (python3 run.py)."
        );
      }
    } else {
      throw new Error(
        "Backend server is not reachable. Please make sure the backend is running on http://127.0.0.1:8000 (python3 run.py)."
      );
    }
  }

  const contentType = response.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else if (contentType && (contentType.includes("sheet") || contentType.includes("csv") || contentType.includes("octet-stream"))) {
    return response.blob();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = "An error occurred";
    if (data && data.detail) {
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(d => d.msg || JSON.stringify(d)).join(", ");
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  googleAuth: (payload) =>
    apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMe: () => apiRequest("/auth/me"),
};

export const teacherApi = {
  uploadFile: (formData) =>
    apiRequest("/teacher/upload", {
      method: "POST",
      body: formData,
    }),
  directFillRecords: (records) =>
    apiRequest("/teacher/direct-fill", {
      method: "POST",
      body: JSON.stringify({ records }),
    }),
  downloadSampleTemplate: async () => {
    const blob = await apiRequest("/teacher/sample-template");
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pccoe_student_upload_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  getStudents: () => apiRequest("/teacher/students"),
  getPairings: (subjectId) =>
    apiRequest(`/teacher/pairings${subjectId ? `?subject_id=${subjectId}` : ""}`),
  runMatching: (subjectId, strategy) =>
    apiRequest("/teacher/run-matching", {
      method: "POST",
      body: JSON.stringify({ subject_id: subjectId, strategy }),
    }),
  exportPairingsCsv: async () => {
    const blob = await apiRequest("/teacher/export-pairings");
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pccoe_peer_pairings.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const studentApi = {
  getDashboard: () => apiRequest("/student/dashboard"),
  updateAcademicProfile: (payload) =>
    apiRequest("/student/update-academic-profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  selectElective: (electiveGroup, courseCode) =>
    apiRequest("/student/select-elective", {
      method: "POST",
      body: JSON.stringify({
        elective_group: electiveGroup,
        course_code: courseCode,
      }),
    }),
  getCurriculum: (year, semester, scheme) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (semester) params.append("semester", semester);
    if (scheme) params.append("scheme", scheme);
    return apiRequest(`/student/curriculum?${params.toString()}`);
  },
  updateMilestone: (pairingId, milestoneIndex, completed) =>
    apiRequest("/student/update-milestone", {
      method: "POST",
      body: JSON.stringify({
        pairing_id: pairingId,
        milestone_index: milestoneIndex,
        completed,
      }),
    }),
};

export const subjectApi = {
  getSubjects: () => apiRequest("/subjects"),
};
