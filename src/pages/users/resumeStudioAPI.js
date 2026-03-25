const h = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const ok = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return Promise.reject(error);
  }
  return response.json();
};

const BASE = "http://127.0.0.1:8082";
const rawFetch = window.fetch.bind(window);
const apiFetch = (url, options = {}) => rawFetch(url.startsWith("/api") ? `${BASE}${url}` : url, options);

const toQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export const resumeAPI = {
  create: (body) => apiFetch("/api/resumes", { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  getById: (id) => apiFetch(`/api/resumes/${id}`, { headers: h() }).then(ok),
  getAll: () => apiFetch("/api/resumes", { headers: h() }).then(ok),
};

export const templateAPI = {
  getAll: (params = {}) => apiFetch(`/api/templates${toQuery(params)}`, { headers: h() }).then(ok),
  getRecommendations: (professionType, mood) => apiFetch(`/api/templates/recommendations${toQuery({ professionType, mood })}`, { headers: h() }).then(ok),
  getById: (id) => apiFetch(`/api/templates/${id}`, { headers: h() }).then(ok),
};

export const layoutAPI = {
  getAll: (params = {}) => apiFetch(`/api/layouts${toQuery(params)}`, { headers: h() }).then(ok),
  getById: (id) => apiFetch(`/api/layouts/${id}`, { headers: h() }).then(ok),
};

export const themeAPI = {
  getAll: (params = {}) => apiFetch(`/api/themes${toQuery(params)}`, { headers: h() }).then(ok),
  getById: (id) => apiFetch(`/api/themes/${id}`, { headers: h() }).then(ok),
};

export const blockAPI = {
  getAll: (resumeId) => apiFetch(`/api/blocks/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => apiFetch("/api/blocks", { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => apiFetch(`/api/blocks/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  reorder: (resumeId, orderedIds) => apiFetch(`/api/blocks/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(orderedIds) }).then(ok),
  delete: (id) => apiFetch(`/api/blocks/${id}`, { method: "DELETE", headers: h() }),
};

export const subscriptionAPI = {
  getMyPlan: () => apiFetch("/api/subscription/plan", { headers: h() }).then(ok),
  getDetails: () => apiFetch("/api/subscription/me", { headers: h() }).then(ok),
  isActive: () => apiFetch("/api/subscription/active", { headers: h() }).then(ok),
};

export const sectionAPI = {
  getAll: (resumeId) => apiFetch(`/api/sections/resume/${resumeId}`, { headers: h() }).then(ok),
};

