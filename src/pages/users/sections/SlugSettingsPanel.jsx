import { useEffect, useMemo, useState } from "react";
import { Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { resumeAPI } from "../editorAPI";

const PLAN_ORD = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

export default function SlugSettingsPanel({ resumeId, userPlan, resume, onResumeUpdate, onNotify }) {
  const canUse = (PLAN_ORD[userPlan] ?? 0) >= 2;
  const [slug, setSlug] = useState(resume?.slug || "");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSlug(resume?.slug || "");
  }, [resume?.slug]);

  const normalizedPreview = useMemo(() => String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, ""), [slug]);

  const checkAvailability = async () => {
    if (!normalizedPreview) {
      setAvailable(null);
      setMessage("Enter a slug first.");
      return;
    }
    setChecking(true);
    try {
      const res = await resumeAPI.checkSlugAvailability(resumeId, normalizedPreview);
      const ok = Boolean(res?.available);
      setAvailable(ok);
      setMessage(ok ? "This public URL is available." : "This public URL is already taken.");
    } catch (error) {
      setAvailable(false);
      setMessage(error?.message || "Could not verify availability.");
    } finally {
      setChecking(false);
    }
  };

  const saveSlug = async () => {
    if (!normalizedPreview) {
      setAvailable(false);
      setMessage("Public URL must be 3-40 characters.");
      return;
    }
    setSaving(true);
    try {
      const updated = await resumeAPI.updateSlug(resumeId, normalizedPreview);
      onResumeUpdate?.(updated);
      setAvailable(true);
      setMessage("Public URL updated.");
      onNotify?.("Public URL updated");
    } catch (error) {
      setAvailable(false);
      setMessage(error?.message || "Could not update public URL.");
      onNotify?.(error?.message || "Could not update public URL.", false);
    } finally {
      setSaving(false);
    }
  };

  if (!canUse) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: "2px dashed #E5E3DE", borderRadius: 14, background: "#FAFAF8" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>??</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C", fontFamily: "'DM Serif Display',serif", marginBottom: 6 }}>
          Custom Public URL
        </div>
        <div style={{ fontSize: 12, color: "#8A8578", fontFamily: "'DM Sans',sans-serif", marginBottom: 16, lineHeight: 1.6 }}>
          Your public link currently follows your signup username.<br />
          Custom slug editing is available on <strong>PRO</strong> and <strong>PREMIUM</strong> plans.
        </div>
        <a href="/upgrade" style={{ background: "#7B3FA0", color: "#fff", borderRadius: 9, padding: "9px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}>
          Upgrade to PRO ?
        </a>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: "8px 12px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BFDBFE", fontSize: 11, color: "#1d4ed8", marginBottom: 16 }}>
        <Globe size={12} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />
        This changes your public portfolio URL only. Your login username stays the same.
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8578", marginBottom: 8 }}>
        Public URL
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ padding: "11px 12px", borderRadius: 10, background: "#F7F3EC", border: "1px solid #E5E3DE", color: "#7A6E5E", fontSize: 12 }}>/p/</div>
        <input
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setAvailable(null);
            setMessage("");
          }}
          placeholder="your-public-name"
          style={{ flex: 1, border: "1.5px solid #E5E3DE", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#1C1C1C", background: "#fff" }}
        />
      </div>

      <div style={{ fontSize: 11, color: "#8A8578", marginBottom: 14 }}>
        Preview: <strong style={{ color: "#1C1C1C" }}>/p/{normalizedPreview || "your-public-name"}</strong>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button type="button" onClick={checkAvailability} disabled={checking} style={{ border: "1px solid #D7CCB8", borderRadius: 999, background: "#fff", color: "#5F5246", padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: checking ? "default" : "pointer" }}>
          {checking ? "Checking..." : "Check Availability"}
        </button>
        <button type="button" onClick={saveSlug} disabled={saving} style={{ border: "none", borderRadius: 999, background: "#1C1C1C", color: "#F8F3EA", padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
          {saving ? "Saving..." : "Save Public URL"}
        </button>
      </div>

      {message ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: available ? "rgba(34,197,94,0.08)" : "rgba(180,60,60,0.08)", color: available ? "#2F7D4B" : "#B43C3C", fontSize: 12 }}>
          {available ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {message}
        </div>
      ) : null}
    </div>
  );
}

