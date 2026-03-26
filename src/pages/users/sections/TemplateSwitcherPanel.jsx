import { useEffect, useMemo, useState } from "react";
import { Sparkles, Lock, Loader2, Check } from "lucide-react";
import { resumeAPI } from "../editorAPI";
import { templateAPI } from "../resumeStudioAPI";
import TemplateCardPreview from "../../../templates/TemplateCardPreview";
import { isImplementedTemplate } from "../../../templates/implementedTemplates";

const PLAN_ORD = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

export default function TemplateSwitcherPanel({ resumeId, userPlan, resume, onResumeUpdate, onNotify }) {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const canUse = (PLAN_ORD[userPlan] ?? 0) >= 2;

  useEffect(() => {
    if (!canUse) {
      setLoading(false);
      return;
    }
    let active = true;
    templateAPI.getAll()
      .then((items) => {
        if (!active) return;
        const safeItems = Array.isArray(items) ? items.filter((item) => isImplementedTemplate(item.templateKey || item.renderFamily)) : [];
        setTemplates(safeItems);
      })
      .catch(() => {
        if (active) setTemplates([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canUse]);

  const currentTemplateId = resume?.templateId;
  const currentTemplateKey = String(resume?.templateKey || "").toUpperCase();

  const orderedTemplates = useMemo(() => {
    const list = [...templates];
    list.sort((a, b) => {
      const aCurrent = a.id === currentTemplateId || String(a.templateKey || a.renderFamily || "").toUpperCase() === currentTemplateKey;
      const bCurrent = b.id === currentTemplateId || String(b.templateKey || b.renderFamily || "").toUpperCase() === currentTemplateKey;
      if (aCurrent && !bCurrent) return -1;
      if (!aCurrent && bCurrent) return 1;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    return list;
  }, [templates, currentTemplateId, currentTemplateKey]);

  const handleChangeTemplate = async (template) => {
    if (!resume?.id || !template?.id || template.id === currentTemplateId) return;
    setSavingId(template.id);
    try {
      const updated = await resumeAPI.changeTemplate(resumeId, template.id);
      onResumeUpdate?.(updated);
      onNotify?.(`Template changed to ${template.name}`);
    } catch (error) {
      onNotify?.(error?.message || "Template change failed", false);
    } finally {
      setSavingId(null);
    }
  };

  if (!canUse) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: "2px dashed #E5E3DE", borderRadius: 14, background: "#FAFAF8" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>??</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C", fontFamily: "'DM Serif Display',serif", marginBottom: 6 }}>
          Change Template
        </div>
        <div style={{ fontSize: 12, color: "#8A8578", fontFamily: "'DM Sans',sans-serif", marginBottom: 16, lineHeight: 1.6 }}>
          Switch your existing portfolio to another premium template while keeping your content intact.<br />
          Available on <strong>PRO</strong> and <strong>PREMIUM</strong> plans.
        </div>
        <a href="/upgrade" style={{ background: "#7B3FA0", color: "#fff", borderRadius: 9, padding: "9px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}>
          Upgrade to PRO ?
        </a>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", color: "#8A8578", fontFamily: "'DM Sans',sans-serif" }}><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /></div>;
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: "8px 12px", borderRadius: 8, background: "#F0F9FF", border: "1px solid #BFDBFE", fontSize: 11, color: "#1d4ed8", marginBottom: 16 }}>
        <Sparkles size={12} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />
        Changing template keeps your content and moves the resume to the selected premium design family.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {orderedTemplates.map((template) => {
          const isCurrent = template.id === currentTemplateId || String(template.templateKey || template.renderFamily || "").toUpperCase() === currentTemplateKey;
          const saving = savingId === template.id;
          return (
            <div key={template.id} style={{ border: isCurrent ? "2px solid #1C1C1C" : "1px solid #E7E0D6", borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 10px 24px rgba(28,28,28,0.06)" }}>
              <div style={{ padding: 10, background: "linear-gradient(180deg, #F8F3EA 0%, #F2ECE2 100%)" }}>
                <TemplateCardPreview template={template} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C" }}>{template.name}</div>
                    <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#817665" }}>{template.renderFamily || template.templateKey}</div>
                  </div>
                  <div style={{ borderRadius: 999, background: "#F2EEE7", color: "#7A6E5E", padding: "4px 7px", fontSize: 9.5, fontWeight: 700 }}>{template.planLevel}</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#7D7468", lineHeight: 1.45 }}>{template.tagline || template.description || "Premium portfolio template."}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    disabled={isCurrent || saving}
                    onClick={() => handleChangeTemplate(template)}
                    style={{ border: "none", borderRadius: 999, padding: "9px 13px", background: isCurrent ? "#EDE8DD" : "#1C1C1C", color: isCurrent ? "#7A6E5E" : "#F8F3EA", fontSize: 11, fontWeight: 700, cursor: isCurrent || saving ? "default" : "pointer" }}
                  >
                    {saving ? "Switching..." : isCurrent ? "Current Template" : "Use This Template"}
                  </button>
                  {isCurrent ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#2F7D4B", textTransform: "uppercase", letterSpacing: "0.08em" }}><Check size={11} /> Active</span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!orderedTemplates.length ? (
        <div style={{ marginTop: 16, padding: "18px 16px", borderRadius: 14, border: "1px dashed #D8CDBA", background: "#FBF8F2", color: "#7B6F5D", fontSize: 12, textAlign: "center" }}>
          No implemented premium templates are available yet.
        </div>
      ) : null}
    </div>
  );
}
