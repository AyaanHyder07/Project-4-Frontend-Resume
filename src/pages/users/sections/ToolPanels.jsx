/**
 * ThemeCustomizerPanel.jsx  â†’  users/sections/ThemeCustomizerPanel.jsx
 * PRO/PREMIUM ONLY â€” backend enforces via subscriptionService.validateThemeCustomization()
 *
 * PUT /api/users/{userId}/resumes/{resumeId}/theme/customize
 * GET /api/users/{userId}/resumes/{resumeId}/theme/customization
 * GET /api/users/{userId}/resumes/{resumeId}/theme/resolved?baseThemeId=
 * DELETE /api/users/{userId}/resumes/{resumeId}/theme/customization
 *
 * SaveCustomizationRequest fields (all optional â€” null = use base theme default):
 *   baseThemeId, primaryColor, secondaryColor, accentColor,
 *   textPrimaryColor, textSecondaryColor, pageBackgroundColor,
 *   customGradient, headingFont, bodyFont, baseFontSize,
 *   headingWeight, enableGrain, grainIntensity, cardBorderRadius
 */

import { useState, useEffect } from "react";
import { themeCustomAPI, subscriptionAPI } from "../editorAPI";
import { Field, Input, Toggle, FormActions, ErrorBox, SectionLoader } from "../sectionAtoms";

const FONTS = [
  "'Cormorant Garamond',Georgia,serif",
  "'Playfair Display',Georgia,serif",
  "'Fraunces',Georgia,serif",
  "'Lora',Georgia,serif",
  "'Merriweather',Georgia,serif",
  "'DM Sans',sans-serif",
  "'Outfit',sans-serif",
  "'Raleway',sans-serif",
  "'Josefin Sans',sans-serif",
  "'Bebas Neue',sans-serif",
  "'Space Mono',monospace",
];

export default function ThemeCustomizerPanel({ resumeId, userId, userPlan, resume, onNotify }) {
  const [custom, setCustom] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PLAN_ORD = { FREE:0, BASIC:1, PRO:2, PREMIUM:3 };
  const canUse = (PLAN_ORD[userPlan] ?? 0) >= 3; // PREMIUM only

  const set = (k, v) => setCustom((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!canUse || !userId) { setLoading(false); return; }
    themeCustomAPI.get(userId, resumeId)
      .then((d) => setCustom(d || {}))
      .catch(() => setCustom({}))
      .finally(() => setLoading(false));
  }, [resumeId, userId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      await themeCustomAPI.save(userId, resumeId, {
        baseThemeId: resume?.themeId,
        ...custom,
      });
      onNotify("Theme customization saved âœ“");
    } catch (e) {
      setError(e?.message || "Save failed â€” check your plan");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all customizations? This cannot be undone.")) return;
    try {
      await themeCustomAPI.reset(userId, resumeId);
      setCustom({});
      onNotify("Theme reset to default");
    } catch {
      onNotify("Reset failed", false);
    }
  };

  if (!canUse) return (
    <div style={{ padding:"32px 24px", textAlign:"center", border:"2px dashed #E5E3DE", borderRadius:14, background:"#FAFAF8" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>ðŸŽ¨</div>
      <div style={{ fontSize:15, fontWeight:700, color:"#1C1C1C", fontFamily:"'DM Serif Display',serif", marginBottom:6 }}>
        Theme Customization
      </div>
      <div style={{ fontSize:12, color:"#8A8578", fontFamily:"'DM Sans',sans-serif", marginBottom:16, lineHeight:1.6 }}>
        Override colors, fonts, and effects on your base theme.<br/>
        Available on <strong>PREMIUM</strong> plans.
      </div>
      <a href="/upgrade" style={{ background:"#7B3FA0", color:"#fff", borderRadius:9, padding:"9px 20px", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
        Upgrade to PREMIUM â†’
      </a>
    </div>
  );

  if (loading) return <SectionLoader/>;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ padding:"8px 12px", borderRadius:8, background:"#FFF7ED", border:"1px solid #FED7AA", fontSize:11, color:"#92400E", marginBottom:16 }}>
        ðŸ’¡ Only fields you change are saved â€” null fields use the base theme default. Changes apply to your portfolio's appearance.
      </div>

      <ErrorBox msg={error}/>

      <div style={{ fontSize:12, fontWeight:700, color:"#1C1C1C", marginBottom:10 }}>Colors</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        {[
          ["primaryColor","Primary"],["secondaryColor","Secondary"],["accentColor","Accent"],
          ["textPrimaryColor","Text Primary"],["textSecondaryColor","Text Secondary"],["pageBackgroundColor","Page BG"],
        ].map(([k,l]) => (
          <div key={k}>
            <div style={{ fontSize:10, fontWeight:600, color:"#8A8578", marginBottom:4 }}>{l}</div>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ position:"relative", width:32, height:32, flexShrink:0 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:custom[k]||"#E5E3DE", border:"2px solid rgba(0,0,0,0.08)", cursor:"pointer" }}/>
                <input type="color" value={custom[k]||"#cccccc"} onChange={(e)=>set(k,e.target.value)}
                  style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%", border:"none" }}/>
              </div>
              <button onClick={()=>set(k,null)} style={{ fontSize:9, color:"#B43C3C", background:"none", border:"none", cursor:"pointer" }}>
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:12, fontWeight:700, color:"#1C1C1C", marginBottom:10 }}>Typography</div>
      <Field label="Heading Font">
        <select value={custom.headingFont||""} onChange={(e)=>set("headingFont",e.target.value||null)}
          style={{ width:"100%", border:"1.5px solid #E5E3DE", borderRadius:9, padding:"8px 11px", fontSize:12, color:"#1C1C1C", background:"#FAFAF8", fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
          <option value="">Default (from base theme)</option>
          {FONTS.map((f)=><option key={f} value={f}>{f.split(",")[0].replace(/'/g,"")}</option>)}
        </select>
      </Field>
      <Field label="Body Font">
        <select value={custom.bodyFont||""} onChange={(e)=>set("bodyFont",e.target.value||null)}
          style={{ width:"100%", border:"1.5px solid #E5E3DE", borderRadius:9, padding:"8px 11px", fontSize:12, color:"#1C1C1C", background:"#FAFAF8", fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
          <option value="">Default (from base theme)</option>
          {FONTS.map((f)=><option key={f} value={f}>{f.split(",")[0].replace(/'/g,"")}</option>)}
        </select>
      </Field>

      <div style={{ fontSize:12, fontWeight:700, color:"#1C1C1C", marginBottom:10 }}>Effects</div>
      <Toggle val={custom.enableGrain||false} onChange={(v)=>set("enableGrain",v)} label="Film Grain Effect" sub="Adds organic texture overlay"/>
      {custom.enableGrain && (
        <Field label="Grain Intensity (5-80)">
          <Input type="number" value={custom.grainIntensity||25} onChange={(v)=>set("grainIntensity",Number(v))} placeholder="25"/>
        </Field>
      )}
      <Field label="Card Border Radius" hint="e.g. 8px, 14px, 0px">
        <Input value={custom.cardBorderRadius||""} onChange={(v)=>set("cardBorderRadius",v)} placeholder="8px"/>
      </Field>

      <FormActions onSave={handleSave} saving={saving} saveLabel="Save Customization"/>
      <button onClick={handleReset} style={{ width:"100%", marginTop:8, padding:"9px", border:"1.5px solid #E5E3DE", borderRadius:9, background:"transparent", color:"#B43C3C", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
        Reset to Base Theme
      </button>
    </div>
  );
}


/**
 * VersioningPanel.jsx  â†’  users/sections/VersioningPanel.jsx
 * PRO/PREMIUM ONLY
 *
 * POST /api/resumes/{resumeId}/versions    body: { changeNote }
 * GET  /api/resumes/{resumeId}/versions
 * POST /api/resumes/{resumeId}/versions/revert
 *
 * Max 2 versions stored. Oldest dropped when at cap.
 * ResumeVersionResponse: id, resumeId, current, templateId, templateVersion,
 *   layoutId, layoutVersion, themeId, themeVersion, changeNote, createdAt
 */

export function VersioningPanel({ resumeId, userPlan, onNotify }) {
  const [versions, setVersions] = useState([]);
  const [note, setNote]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [reverting, setReverting]= useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const PLAN_ORD = { FREE:0, BASIC:1, PRO:2, PREMIUM:3 };
  const canUse = (PLAN_ORD[userPlan]??0) >= 2;

  const load = () => {
    if (!canUse) { setLoading(false); return; }
    setLoading(true);
    import("../editorAPI").then(({ versionAPI }) =>
      versionAPI.getAll(resumeId).then((d)=>setVersions(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{ load(); },[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { versionAPI } = await import("../editorAPI");
      await versionAPI.create(resumeId, note || "Manual snapshot");
      setNote(""); onNotify("Version snapshot saved âœ“"); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleRevert = async () => {
    if (!window.confirm("Revert to previous version? Your current state will be overwritten.")) return;
    setReverting(true);
    try {
      const { versionAPI } = await import("../editorAPI");
      await versionAPI.revert(resumeId);
      onNotify("Reverted to previous version âœ“"); load();
    } catch(e) { setError(e?.message||"Revert failed"); }
    finally { setReverting(false); }
  };

  if (!canUse) return (
    <div style={{ padding:"32px 24px", textAlign:"center", border:"2px dashed #E5E3DE", borderRadius:14, background:"#FAFAF8" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>ðŸ•</div>
      <div style={{ fontSize:15, fontWeight:700, color:"#1C1C1C", fontFamily:"'DM Serif Display',serif", marginBottom:6 }}>
        Version History
      </div>
      <div style={{ fontSize:12, color:"#8A8578", fontFamily:"'DM Sans',sans-serif", marginBottom:16, lineHeight:1.6 }}>
        Save snapshots of your portfolio and revert when needed.<br/>
        Available on <strong>PREMIUM</strong> plans.
      </div>
      <a href="/upgrade" style={{ background:"#7B3FA0", color:"#fff", borderRadius:9, padding:"9px 20px", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
        Upgrade to PREMIUM â†’
      </a>
    </div>
  );

  if (loading) return <SectionLoader/>;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ padding:"8px 12px", borderRadius:8, background:"#F0F9FF", border:"1px solid #BFDBFE", fontSize:11, color:"#1d4ed8", marginBottom:16 }}>
        ðŸ“ Max 2 snapshots stored. Saving a new one drops the oldest.
      </div>
      <ErrorBox msg={error}/>

      <Field label="Change Note" hint="Describe what you changed before saving">
        <Input value={note} onChange={setNote} placeholder="Updated work experience sectionâ€¦"/>
      </Field>
      <button onClick={handleSave} disabled={saving} style={{ width:"100%", padding:"10px", background:"#1C1C1C", color:"#F0EDE6", border:"none", borderRadius:9, fontSize:12.5, fontWeight:700, cursor:saving?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:20, opacity:saving?0.7:1 }}>
        {saving ? "Savingâ€¦" : "ðŸ’¾ Save Snapshot"}
      </button>

      {versions.length > 0 ? (
        <>
          <div style={{ fontSize:12, fontWeight:700, color:"#1C1C1C", marginBottom:10 }}>Saved Versions</div>
          {versions.map((v) => (
            <div key={v.id} style={{ padding:"11px 13px", border:"1.5px solid #E5E3DE", borderRadius:11, marginBottom:8, background:v.current?"#FAFAF8":"#fff" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                {v.current&&<span style={{ fontSize:9.5, fontWeight:700, color:"#22c55e", background:"rgba(34,197,94,0.1)", padding:"1px 7px", borderRadius:20 }}>Current</span>}
                <span style={{ fontSize:11, fontWeight:600, color:"#1C1C1C" }}>{v.changeNote||"Snapshot"}</span>
              </div>
              <div style={{ fontSize:10, color:"#8A8578" }}>
                {v.createdAt ? new Date(v.createdAt).toLocaleString("en-IN") : "â€”"}
              </div>
            </div>
          ))}
          {versions.length >= 2 && (
            <button onClick={handleRevert} disabled={reverting} style={{ width:"100%", marginTop:8, padding:"9px", border:"1.5px solid #C9963A", borderRadius:9, background:"rgba(201,150,58,0.08)", color:"#C9963A", fontSize:12, fontWeight:700, cursor:reverting?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              {reverting ? "Revertingâ€¦" : "â†© Revert to Previous Version"}
            </button>
          )}
        </>
      ) : (
        <div style={{ textAlign:"center", padding:"24px 0", color:"#8A8578", fontSize:12 }}>
          No snapshots yet. Save your first one above.
        </div>
      )}
    </div>
  );
}


/**
 * SectionManager.jsx  â†’  users/SectionManager.jsx
 * Manage which sections are enabled/disabled and their order.
 *
 * GET /api/sections/resume/{resumeId}
 * PUT /api/sections/{configId}  body: { enabled?, customTitle?, displayOrder? }
 * PUT /api/sections/resume/{resumeId}/reorder  body: string[]
 *
 * PortfolioSectionResponse: id, resumeId, sectionName, enabled,
 *   displayOrder, customTitle, createdAt, updatedAt
 */

export function SectionManager({ resumeId, onNotify }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(null); // configId being saved

  useEffect(() => {
    setLoading(true);
    import("../editorAPI").then(({ sectionAPI }) =>
      sectionAPI.getAll(resumeId).then((d)=>setSections(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  }, [resumeId]);

  const toggleSection = async (section) => {
    setSaving(section.id);
    try {
      const { sectionAPI } = await import("../editorAPI");
      const updated = await sectionAPI.update(section.id, { enabled: !section.enabled });
      setSections((p)=>p.map((s)=>s.id===section.id?updated:s));
      onNotify(`${section.sectionName?.replace(/_/g," ")} ${!section.enabled?"enabled":"disabled"}`);
    } catch { onNotify("Toggle failed", false); }
    finally { setSaving(null); }
  };

  const updateTitle = async (section, title) => {
    try {
      const { sectionAPI } = await import("../editorAPI");
      await sectionAPI.update(section.id, { customTitle: title || null });
      setSections((p)=>p.map((s)=>s.id===section.id?{...s,customTitle:title}:s));
    } catch { onNotify("Update failed", false); }
  };

  if (loading) return <SectionLoader/>;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ padding:"8px 12px", borderRadius:8, background:"#F0F9FF", border:"1px solid #BFDBFE", fontSize:11, color:"#1d4ed8", marginBottom:16 }}>
        ðŸ’¡ Toggle sections on/off and set custom display titles. Disabled sections are hidden from your public portfolio.
      </div>

      {sections.map((s) => (
        <div key={s.id} style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"10px 13px", border:"1.5px solid #E5E3DE",
          borderRadius:11, marginBottom:8, background:"#fff",
          transition:"opacity 0.15s",
          opacity: s.enabled ? 1 : 0.6,
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#1C1C1C" }}>
              {s.customTitle || s.sectionName?.replace(/_/g," ")}
            </div>
            {s.sectionName && (
              <div style={{ fontSize:10, color:"#8A8578", marginTop:1 }}>
                {s.sectionName.replace(/_/g," ")}
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap: 7, flexShrink:0 }}>
            <span style={{
              fontSize:10, fontWeight:600,
              color: s.enabled ? "#22c55e" : "#8A8578",
            }}>
              {s.enabled ? "On" : "Off"}
            </span>
            <div
              onClick={() => toggleSection(s)}
              style={{
                width:38, height:20, borderRadius:10,
                background: s.enabled ? "#1C1C1C" : "#D5D3CE",
                position:"relative", cursor:"pointer", transition:"background 0.18s",
              }}
            >
              {saving === s.id
                ? <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
                : <div style={{ position:"absolute", top:3, left: s.enabled ? 20 : 3, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left 0.18s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

