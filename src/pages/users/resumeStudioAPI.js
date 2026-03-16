/**
 * resumeStudioAPI.js
 * All API calls used in the Resume Creation Studio.
 * Every request/response shape matches the backend exactly.
 */

const BASE = "http://127.0.0.1:8081";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ─── RESUMES ──────────────────────────────────────────────────────────── */

const handleRes = (r) => {
  if (r.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  if (!r.ok) return r.json().catch(() => ({})).then((e) => Promise.reject(e));
  return r.json();
};

export const resumeAPI = {
  getAll: () =>
    fetch(`${BASE}/api/resumes`, { headers: headers() }).then(handleRes),

  getById: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}`, { headers: headers() }).then(handleRes),

  create: (body) =>
    fetch(`${BASE}/api/resumes`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then(handleRes),

  updateMeta: (resumeId, body) =>
    fetch(`${BASE}/api/resumes/${resumeId}/meta`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(body),
    }).then(handleRes),

  submit: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}/submit`, {
      method: "POST",
      headers: headers(),
    }).then(handleRes),

  publish: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}/publish`, {
      method: "POST",
      headers: headers(),
    }).then(handleRes),

  unpublish: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}/unpublish`, {
      method: "POST",
      headers: headers(),
    }).then(handleRes),

  delete: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}`, {
      method: "DELETE",
      headers: headers(),
    }),
};

export const templateAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/templates${q ? "?" + q : ""}`, {
      headers: headers(),
    }).then((r) => { 
      if (r.status === 401) { localStorage.removeItem("token"); window.location.href = "/login"; }
      if (!r.ok) return Promise.reject(r.status);
      return r.text().then(t => JSON.parse(t));
    });
  },

  getById: (id) =>
    fetch(`${BASE}/api/templates/${id}`, { headers: headers() }).then((r) => {
      if (r.status === 401) { localStorage.removeItem("token"); window.location.href = "/login"; }
      if (r.status === 403) throw new Error("Plan upgrade required for this template");
      return r.json();
    }),
};

/* ─── THEMES ───────────────────────────────────────────────────────────── */

/**
 * GET /api/themes              → all themes for user's plan
 * GET /api/themes?audience=    → filtered
 * GET /api/themes?mood=        → filtered
 * GET /api/themes/{id}         → single active theme
 *
 * Backend: userId nullable → FREE fallback if not authenticated
 */
export const themeAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/themes${q ? "?" + q : ""}`, {
      headers: headers(),
    }).then(handleRes);
  },

  getById: (id) =>
    fetch(`${BASE}/api/themes/${id}`, { headers: headers() }).then(handleRes),
};

export const subscriptionAPI = {
  getMyPlan: () =>
    fetch(`${BASE}/api/subscription/plan`, { headers: headers() }).then(handleRes),
  isActive: () =>
    fetch(`${BASE}/api/subscription/active`, { headers: headers() }).then(handleRes),
  getDetails: () =>
    fetch(`${BASE}/api/subscription/me`, { headers: headers() }).then(handleRes),
};

export const sectionAPI = {
  getSections: (resumeId) =>
    fetch(`${BASE}/api/sections/resume/${resumeId}`, {
      headers: headers(),
    }).then(handleRes),

  updateSection: (configId, body) =>
    fetch(`${BASE}/api/sections/${configId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
    }).then(handleRes),

  reorder: (resumeId, orderedIds) =>
    fetch(`${BASE}/api/sections/resume/${resumeId}/reorder`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(orderedIds),
    }),
};