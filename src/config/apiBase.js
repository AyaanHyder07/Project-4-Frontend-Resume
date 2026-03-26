const FALLBACK_API_BASE = "http://127.0.0.1:8082";

const apiBase = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || "").trim();

export const API_BASE_URL = apiBase || FALLBACK_API_BASE;

export function resolveApiUrl(path = "") {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}
