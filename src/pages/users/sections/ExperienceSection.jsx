/**
 * ExperienceSection.jsx  →  users/sections/ExperienceSection.jsx
 * Connected to: ResumeEditorPage (activeSection === "experience")
 *
 * EMPLOYMENT_TYPES from EmploymentType enum (backend does .toUpperCase()):
 *   FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, SELF_EMPLOYED
 *
 * Dates sent as strings → backend does LocalDate.parse()
 * currentlyWorking=true → endDate not required
 * ExperienceResponse fields: id, resumeId, organizationName, employmentType,
 *   roleTitle, location, startDate, endDate, currentlyWorking, roleDescription,
 *   keyAchievements, skillsUsed, displayOrder, createdAt, updatedAt
 */

import { useState, useEffect } from "react";
import { experienceAPI } from "../editorAPI";
import {
    Field, Input, Textarea, Select, Toggle,
    FormActions, FormGrid, ErrorBox,
    ItemCard, AddBtn, SectionLoader, SectionEmpty,
} from "../sectionAtoms";

const EMP_TYPES = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "SELF_EMPLOYED", label: "Self Employed" },
];

const DEF_EXP = {
    organizationName: "", employmentType: "FULL_TIME",
    roleTitle: "", location: "", startDate: "",
    endDate: "", currentlyWorking: false,
    roleDescription: "", keyAchievements: "", skillsUsed: "",
};

export function ExperienceSection({ resumeId, onNotify }) {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null); // null=list, "new"=new form, id=edit form
    const [form, setForm] = useState({ ...DEF_EXP });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const load = () => {
        setLoading(true);
        experienceAPI.getAll(resumeId)
            .then((d) => setItems(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [resumeId]);

    const startEdit = (item) => {
        setForm({
            organizationName: item.organizationName || "",
            employmentType: item.employmentType || "FULL_TIME",
            roleTitle: item.roleTitle || "",
            location: item.location || "",
            startDate: item.startDate ? String(item.startDate) : "",
            endDate: item.endDate ? String(item.endDate) : "",
            currentlyWorking: item.currentlyWorking || false,
            roleDescription: item.roleDescription || "",
            keyAchievements: item.keyAchievements ? item.keyAchievements.join("\n") : "",
            skillsUsed: item.skillsUsed ? item.skillsUsed.join(", ") : "",
        });
        setEditing(item.id);
        setError(null);
    };

    const handleSave = async () => {
        setError(null);
        setSaving(true);
        try {
            const body = {
                ...form,
                resumeId,
                endDate: form.currentlyWorking ? null : form.endDate || null,
                keyAchievements: form.keyAchievements ? form.keyAchievements.split("\n").map(s => s.trim()).filter(Boolean) : [],
                skillsUsed: form.skillsUsed ? form.skillsUsed.split(",").map(s => s.trim()).filter(Boolean) : [],
            };
            if (editing === "new") {
                await experienceAPI.create(body);
            } else {
                await experienceAPI.update(editing, body);
            }
            onNotify("Experience saved ✓");
            setEditing(null);
            load();
        } catch (e) {
            setError(e?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this experience?")) return;
        setDeleting(id);
        try {
            await experienceAPI.delete(id);
            setItems((p) => p.filter((x) => x.id !== id));
            onNotify("Deleted");
        } catch { onNotify("Delete failed", false); }
        finally { setDeleting(null); }
    };

    if (loading) return <SectionLoader />;

    if (editing !== null) return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
                {editing === "new" ? "Add Experience" : "Edit Experience"}
            </div>
            <ErrorBox msg={error} />
            <FormGrid cols={2}>
                <Field label="Organization" required>
                    <Input value={form.organizationName} onChange={(v) => set("organizationName", v)} placeholder="Acme Corp" />
                </Field>
                <Field label="Employment Type">
                    <Select value={form.employmentType} onChange={(v) => set("employmentType", v)} options={EMP_TYPES} />
                </Field>
                <Field label="Role / Title" required>
                    <Input value={form.roleTitle} onChange={(v) => set("roleTitle", v)} placeholder="Senior Designer" />
                </Field>
                <Field label="Location">
                    <Input value={form.location} onChange={(v) => set("location", v)} placeholder="Mumbai, India" />
                </Field>
                <Field label="Start Date" required>
                    <Input type="date" value={form.startDate} onChange={(v) => set("startDate", v)} />
                </Field>
                <Field label="End Date" hint={form.currentlyWorking ? "Not needed" : ""}>
                    <Input type="date" value={form.endDate} onChange={(v) => set("endDate", v)} disabled={form.currentlyWorking} />
                </Field>
            </FormGrid>
            <Toggle val={form.currentlyWorking} onChange={(v) => set("currentlyWorking", v)} label="I currently work here" />
            <Field label="Role Description">
                <Textarea value={form.roleDescription} onChange={(v) => set("roleDescription", v)} placeholder="Describe your responsibilities…" rows={3} />
            </Field>
            <Field label="Key Achievements" hint="One per line">
                <Textarea value={form.keyAchievements} onChange={(v) => set("keyAchievements", v)} placeholder="Led redesign of checkout flow, improving conversion by 30%…" rows={2} />
            </Field>
            <Field label="Skills Used" hint="Comma-separated">
                <Input value={form.skillsUsed} onChange={(v) => set("skillsUsed", v)} placeholder="Figma, React, TypeScript" />
            </Field>
            <FormActions onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        </div>
    );

    if (items.length === 0) return (
        <SectionEmpty emoji="💼" title="No experience added yet"
            subtitle="Add your work history — internships, jobs, freelance projects."
            onAdd={() => { setForm({ ...DEF_EXP }); setEditing("new"); }}
        />
    );

    return (
        <div>
            {items.map((item) => (
                <ItemCard key={item.id}
                    onEdit={() => startEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    deleting={deleting === item.id}
                >
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C", fontFamily: "'DM Sans',sans-serif" }}>
                        {item.roleTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#5A5550", fontFamily: "'DM Sans',sans-serif" }}>
                        {item.organizationName} · {item.employmentType?.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#8A8578", marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>
                        {item.startDate} → {item.currentlyWorking ? "Present" : item.endDate || "—"}
                        {item.location ? ` · ${item.location}` : ""}
                    </div>
                </ItemCard>
            ))}
            <AddBtn onClick={() => { setForm({ ...DEF_EXP }); setEditing("new"); }} label="Add Experience" />
        </div>
    );
}

export default ExperienceSection;


/**
 * ────────────────────────────────────────────────────────────────
 * EducationSection.jsx  →  users/sections/EducationSection.jsx
 * Fields: institutionName, degree, specialization, grade,
 *         startYear(int), endYear(int nullable), description
 * Validation: startYear not future, endYear not before startYear
 * ────────────────────────────────────────────────────────────────
 */

export function EducationSection({ resumeId, onNotify }) {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const DEF = { institutionName: "", degree: "", specialization: "", grade: "", startYear: "", endYear: "", description: "" };

    const load = () => {
        setLoading(true);
        import("../editorAPI").then(({ educationAPI }) =>
            educationAPI.getAll(resumeId)
                .then((d) => setItems(Array.isArray(d) ? d : []))
                .finally(() => setLoading(false))
        );
    };

    useEffect(() => { load(); }, [resumeId]);

    const handleSave = async () => {
        setError(null);
        setSaving(true);
        try {
            const { educationAPI } = await import("../editorAPI");
            const body = { ...form, resumeId, startYear: Number(form.startYear), endYear: form.endYear ? Number(form.endYear) : null };
            if (editing === "new") { await educationAPI.create(body); }
            else { await educationAPI.update(editing, body); }
            onNotify("Education saved ✓");
            setEditing(null);
            load();
        } catch (e) { setError(e?.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete?")) return;
        setDeleting(id);
        try {
            const { educationAPI } = await import("../editorAPI");
            await educationAPI.delete(id);
            setItems((p) => p.filter((x) => x.id !== id));
            onNotify("Deleted");
        } catch { onNotify("Delete failed", false); }
        finally { setDeleting(null); }
    };

    if (loading) return <SectionLoader />;

    if (editing !== null) return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
                {editing === "new" ? "Add Education" : "Edit Education"}
            </div>
            <ErrorBox msg={error} />
            <Field label="Institution Name" required>
                <Input value={form.institutionName} onChange={(v) => set("institutionName", v)} placeholder="IIT Bombay" />
            </Field>
            <FormGrid cols={2}>
                <Field label="Degree" required>
                    <Input value={form.degree} onChange={(v) => set("degree", v)} placeholder="B.Tech" />
                </Field>
                <Field label="Specialization">
                    <Input value={form.specialization} onChange={(v) => set("specialization", v)} placeholder="Computer Science" />
                </Field>
                <Field label="Grade / GPA">
                    <Input value={form.grade} onChange={(v) => set("grade", v)} placeholder="9.2 CGPA" />
                </Field>
                <div />
                <Field label="Start Year" required>
                    <Input type="number" value={form.startYear} onChange={(v) => set("startYear", v)} placeholder="2019" />
                </Field>
                <Field label="End Year" hint="Leave blank if ongoing">
                    <Input type="number" value={form.endYear} onChange={(v) => set("endYear", v)} placeholder="2023" />
                </Field>
            </FormGrid>
            <Field label="Description">
                <Textarea value={form.description} onChange={(v) => set("description", v)} placeholder="Relevant coursework, thesis, activities…" rows={2} />
            </Field>
            <FormActions onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        </div>
    );

    if (items.length === 0) return (
        <SectionEmpty emoji="🎓" title="No education added yet"
            subtitle="Add your degrees, diplomas, certifications."
            onAdd={() => { setForm({ ...DEF }); setEditing("new"); }}
        />
    );

    return (
        <div>
            {items.map((item) => (
                <ItemCard key={item.id} onEdit={() => { setForm({ institutionName: item.institutionName || "", degree: item.degree || "", specialization: item.specialization || "", grade: item.grade || "", startYear: item.startYear || "", endYear: item.endYear || "", description: item.description || "" }); setEditing(item.id); }} onDelete={() => handleDelete(item.id)} deleting={deleting === item.id}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C", fontFamily: "'DM Sans',sans-serif" }}>{item.degree} — {item.institutionName}</div>
                    <div style={{ fontSize: 11, color: "#5A5550", fontFamily: "'DM Sans',sans-serif" }}>{item.specialization} {item.grade ? `· ${item.grade}` : ""}</div>
                    <div style={{ fontSize: 10.5, color: "#8A8578", fontFamily: "'DM Sans',sans-serif" }}>{item.startYear} – {item.endYear || "Present"}</div>
                </ItemCard>
            ))}
            <AddBtn onClick={() => { setForm({ ...DEF }); setEditing("new"); }} label="Add Education" />
        </div>
    );
}


/**
 * ────────────────────────────────────────────────────────────────
 * SkillsSection.jsx  →  users/sections/SkillsSection.jsx
 * reorder: PUT /api/skills/reorder/{resumeId}  ← different path!
 * update: partial null-check in service
 * Fields: skillName, category, proficiency, yearsOfExperience, featured
 * ────────────────────────────────────────────────────────────────
 */

const PROFICIENCY = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
    { value: "EXPERT", label: "Expert" },
];

const SKILL_CATEGORIES_TO_ENUM = {
    "Technical": "TECHNICAL",
    "Design": "DOMAIN", // Grouping design under domain
    "Management": "SOFT_SKILL",
    "Communication": "SOFT_SKILL",
    "Language": "LANGUAGE",
    "Tool": "TOOL",
    "Framework": "TOOL", // Grouping frameworks under tool
    "Soft Skill": "SOFT_SKILL",
    "Other": "DOMAIN", // Grouping other under domain
};

export function SkillsSection({ resumeId, onNotify }) {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const DEF = { skillName: "", category: "Technical", proficiency: "INTERMEDIATE", yearsOfExperience: "", featured: false };
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const load = () => {
        setLoading(true);
        import("../editorAPI").then(({ skillAPI }) =>
            skillAPI.getAll(resumeId).then((d) => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
        );
    };

    useEffect(() => { load(); }, [resumeId]);

    const handleSave = async () => {
        setError(null); setSaving(true);
        try {
            const { skillAPI } = await import("../editorAPI");
            
            // Map the frontend display category to the backend enum category
            // If it's already upper case from backend, use it directly, otherwise map it
            let enumCategory = "DOMAIN"; 
            if (form.category) {
                if (form.category === form.category.toUpperCase()) {
                   enumCategory = form.category;
                } else {
                   enumCategory = SKILL_CATEGORIES_TO_ENUM[form.category] || "DOMAIN";
                }
            }

            const body = { 
                ...form, 
                resumeId, 
                category: enumCategory,
                proficiency: form.proficiency ? form.proficiency.toUpperCase() : "INTERMEDIATE",
                yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null 
            };
            if (editing === "new") { await skillAPI.create(body); }
            else { await skillAPI.update(editing, body); }
            onNotify("Skill saved ✓"); setEditing(null); load();
        } catch (e) { setError(e?.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete skill?")) return;
        setDeleting(id);
        try {
            const { skillAPI } = await import("../editorAPI");
            await skillAPI.delete(id);
            setItems((p) => p.filter((x) => x.id !== id));
            onNotify("Deleted");
        } catch { onNotify("Delete failed", false); }
        finally { setDeleting(null); }
    };

    if (loading) return <SectionLoader />;

    // Group by category for display
    const grouped = items.reduce((acc, s) => {
        const cat = s.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
    }, {});

    if (editing !== null) return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
                {editing === "new" ? "Add Skill" : "Edit Skill"}
            </div>
            <ErrorBox msg={error} />
            <FormGrid cols={2}>
                <Field label="Skill Name" required>
                    <Input value={form.skillName} onChange={(v) => set("skillName", v)} placeholder="e.g. Figma" />
                </Field>
                <Field label="Category">
                    <Select value={form.category} onChange={(v) => set("category", v)} options={Object.keys(SKILL_CATEGORIES_TO_ENUM).map((c) => ({ value: c, label: c }))} />
                </Field>
                <Field label="Proficiency">
                    <Select value={form.proficiency} onChange={(v) => set("proficiency", v)} options={PROFICIENCY} />
                </Field>
                <Field label="Years of Experience">
                    <Input type="number" value={form.yearsOfExperience} onChange={(v) => set("yearsOfExperience", v)} placeholder="3" />
                </Field>
            </FormGrid>
            <Toggle val={form.featured} onChange={(v) => set("featured", v)} label="Featured skill" sub="Shown prominently on your portfolio" />
            <FormActions onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        </div>
    );

    if (items.length === 0) return (
        <SectionEmpty emoji="⚡" title="No skills added yet"
            subtitle="Add your technical and soft skills with proficiency levels."
            onAdd={() => { setForm({ ...DEF }); setEditing("new"); }}
        />
    );

    return (
        <div>
            {Object.entries(grouped).map(([cat, skills]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#8A8578", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>
                        {cat}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {skills.map((s) => (
                            <div key={s.id} style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "6px 12px", borderRadius: 20,
                                background: s.featured ? "#1C1C1C" : "#F0EDE6",
                                border: "1.5px solid #E5E3DE",
                                fontSize: 11.5, color: s.featured ? "#F0EDE6" : "#1C1C1C",
                                fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
                            }}>
                                {s.skillName}
                                <span style={{ fontSize: 9.5, opacity: 0.6 }}>
                                    {s.proficiency?.replace(/_/g, " ")}
                                </span>
                                <button onClick={() => { setForm({ skillName: s.skillName || "", category: s.category || "Technical", proficiency: s.proficiency || "INTERMEDIATE", yearsOfExperience: s.yearsOfExperience || "", featured: s.featured || false }); setEditing(s.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", opacity: 0.6, fontSize: 10 }}>✏</button>
                                <button onClick={() => handleDelete(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#B43C3C", fontSize: 10 }}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <AddBtn onClick={() => { setForm({ ...DEF }); setEditing("new"); }} label="Add Skill" />
        </div>
    );
}

