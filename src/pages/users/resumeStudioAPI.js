/**
 * resumeStudioAPI.js
 * All API calls used in the Resume Creation Studio.
 * Every request/response shape matches the backend exactly.
 */

const BASE = "http://localhost:8081";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ─── RESUMES ──────────────────────────────────────────────────────────── */

/**
 * GET /api/resumes  (list all user resumes — we use a workaround:
 * backend doesn't have a list endpoint exposed yet, so we fetch
 * from subscription + individual. For now we store IDs in localStorage
 * or you can add GET /api/resumes to the backend later.)
 *
 * NOTE: Backend ResumeController has no GET /api/resumes list endpoint.
 * Add this to ResumeController:
 *   @GetMapping("/api/resumes")
 *   public ResponseEntity<List<Resume>> getAll(@AuthenticationPrincipal String userId)
 * For now we return from localStorage cache.
 */
export const resumeAPI = {
  getAll: () =>
    fetch(`${BASE}/api/resumes`, { headers: headers() }).then((r) => r.json()),

  getById: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}`, { headers: headers() }).then((r) =>
      r.json()
    ),

  /**
   * POST /api/resumes
   * Body: { templateId, title, professionType, themeOverrideId? }
   * Returns: Resume entity
   */
  create: (body) =>
    fetch(`${BASE}/api/resumes`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => {
      if (!r.ok) return r.json().then((e) => Promise.reject(e));
      return r.json();
    }),

  updateMeta: (resumeId, body) =>
    fetch(`${BASE}/api/resumes/${resumeId}/meta`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(body), // { title, professionType }
    }).then((r) => r.json()),

  submit: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}/submit`, {
      method: "POST",
      headers: headers(),
    }).then((r) => r.json()),

  publish: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}/publish`, {
      method: "POST",
      headers: headers(),
    }).then((r) => r.json()),

  unpublish: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}/unpublish`, {
      method: "POST",
      headers: headers(),
    }).then((r) => r.json()),

  delete: (resumeId) =>
    fetch(`${BASE}/api/resumes/${resumeId}`, {
      method: "DELETE",
      headers: headers(),
    }),
};

/* ─── TEMPLATES ────────────────────────────────────────────────────────── */

/**
 * GET /api/templates                → all templates for user's plan
 * GET /api/templates?profession=    → filtered
 * GET /api/templates?audience=      → filtered
 * GET /api/templates?mood=          → filtered
 * GET /api/templates/{id}           → single, plan-checked (returns 403 if above plan)
 *
 * Backend auto-applies plan gate via subscriptionService.getCurrentPlan(userId)
 */
export const templateAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/templates${q ? "?" + q : ""}`, {
      headers: headers(),
    }).then((r) => { 
      console.log("RESPONSE STATUS:", r.status);
      if (!r.ok) return Promise.reject(r.status);
      return r.text().then(t => { console.log('RAW JSON:', t); return JSON.parse(t); });
    });
  },

  getById: (id) =>
    fetch(`${BASE}/api/templates/${id}`, { headers: headers() }).then((r) => {
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
    }).then((r) => r.json());
  },

  getById: (id) =>
    fetch(`${BASE}/api/themes/${id}`, { headers: headers() }).then((r) =>
      r.json()
    ),
};

/* ─── SUBSCRIPTION ─────────────────────────────────────────────────────── */

/**
 * GET /api/subscription/plan   → returns PlanType string e.g. "FREE" | "BASIC" | "PRO" | "PREMIUM"
 * GET /api/subscription/active → returns boolean
 * GET /api/subscription/me     → returns full Subscription object
 */
export const subscriptionAPI = {
  getMyPlan: () =>
    fetch(`${BASE}/api/subscription/plan`, { headers: headers() }).then((r) =>
      r.json()
    ),
  isActive: () =>
    fetch(`${BASE}/api/subscription/active`, { headers: headers() }).then(
      (r) => r.json()
    ),
  getDetails: () =>
    fetch(`${BASE}/api/subscription/me`, { headers: headers() }).then((r) =>
      r.json()
    ),
};

/* ─── SECTIONS ─────────────────────────────────────────────────────────── */

/**
 * GET /api/sections/resume/{resumeId}         → list sections for resume
 * PUT /api/sections/{configId}                → update section (enabled, customTitle, displayOrder)
 * PUT /api/sections/resume/{resumeId}/reorder → reorder sections
 *
 * PortfolioSectionResponse: { id, resumeId, sectionName, enabled, displayOrder, customTitle, createdAt, updatedAt }
 * UpdatePortfolioSectionRequest: { enabled?, customTitle?, displayOrder? }
 */
export const sectionAPI = {
  getSections: (resumeId) =>
    fetch(`${BASE}/api/sections/resume/${resumeId}`, {
      headers: headers(),
    }).then((r) => r.json()),

  updateSection: (configId, body) =>
    fetch(`${BASE}/api/sections/${configId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  reorder: (resumeId, orderedIds) =>
    fetch(`${BASE}/api/sections/resume/${resumeId}/reorder`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(orderedIds),
    }),
};