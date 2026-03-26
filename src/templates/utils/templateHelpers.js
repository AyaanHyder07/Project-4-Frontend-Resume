import { API_BASE_URL } from "../../config/apiBase";

export function resolveAssetUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

export function getInitials(name) {
  return (name || "Portfolio")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function parseLooseDate(input) {
  if (!input) return null;
  if (typeof input === "number") {
    return new Date(input, 0, 1);
  }
  const value = String(input).trim();
  if (!value) return null;
  if (/^\d{4}$/.test(value)) return new Date(Number(value), 0, 1);
  if (/^\d{4}-\d{2}$/.test(value)) return new Date(`${value}-01T00:00:00`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateRange(startDate, endDate, currentlyWorking) {
  const format = (value) => {
    const parsed = parseLooseDate(value);
    if (!parsed) return value || "";
    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const start = format(startDate);
  const end = currentlyWorking ? "Present" : format(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}

export function injectThemeVars(themeData) {
  return {
    "--color-primary": themeData?.primaryColor || "#0A0A0A",
    "--color-accent": themeData?.accentColor || "#00FF88",
    "--color-bg": themeData?.backgroundColor || "#0A0A0A",
    "--color-text": themeData?.textColor || "#E0E0E0",
    "--font-main": themeData?.fontFamily || "Inter, sans-serif",
  };
}

export function checkMotionPreference() {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
