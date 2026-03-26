/**
 * ProfileSection.jsx  →  users/sections/ProfileSection.jsx
 * Connected to: ResumeEditorPage (activeSection === "profile")
 *
 * POST /api/profile  multipart: data + profilePhoto
 * PUT  /api/profile/{resumeId}  multipart: data + profilePhoto
 * GET  /api/profile/{resumeId}
 *
 * CreateUserProfileRequest fields:
 *   resumeId, email, fullName, displayName, professionalTitle,
 *   bio, detailedBio, dateOfBirth, gender, nationality, location,
 *   availabilityStatus, phone, whatsapp, linkedinUrl, githubUrl,
 *   hobbies, interests, achievementsSummary
 *
 * UserProfileResponse adds: id, profilePhotoUrl, createdAt, updatedAt
 * UpdateUserProfileRequest: same fields but all optional (null-check in service)
 * dateOfBirth in update: LocalDate.parse() → send as "YYYY-MM-DD" string
 */

import { useState, useEffect, useMemo } from "react";
import { profileAPI } from "../editorAPI";
import {
  Field, Input, Textarea, Select, Toggle,
  FileUpload, FormActions, FormGrid, ErrorBox, SectionLoader,
} from "../sectionAtoms";

const AVAILABILITY = [
  { value: "OPEN_TO_WORK", label: "Open to Work" },
  { value: "FREELANCING", label: "Freelancing" },
  { value: "EMPLOYED", label: "Employed" },
  { value: "NOT_AVAILABLE", label: "Not Available" },
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-Binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export default function ProfileSection({ resumeId, onNotify, onPreviewDraftChange }) {
  const [data, setData]     = useState(null);
  const [form, setForm]     = useState({});
  const [photo, setPhoto]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);
  const [exists, setExists] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const photoPreviewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    profileAPI.get(resumeId)
      .then((p) => {
        setData(p);
        setExists(true);
        setForm({
          email: p.email || "",
          fullName: p.fullName || "",
          displayName: p.displayName || "",
          professionalTitle: p.professionalTitle || "",
          bio: p.bio || "",
          detailedBio: p.detailedBio || "",
          dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth) : "",
          gender: p.gender || "",
          nationality: p.nationality || "",
          location: p.location || "",
          availabilityStatus: p.availabilityStatus || "",
          phone: p.phone || "",
          whatsapp: p.whatsapp || "",
          linkedinUrl: p.linkedinUrl || "",
          githubUrl: p.githubUrl || "",
          hobbies: p.hobbies ? p.hobbies.join(", ") : "",
          interests: p.interests ? p.interests.join(", ") : "",
          achievementsSummary: p.achievementsSummary || "",
        });
      })
      .catch(() => { setExists(false); })
      .finally(() => setLoading(false));
  }, [resumeId]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth ? form.dateOfBirth : null,
        hobbies: form.hobbies ? form.hobbies.split(",").map(s => s.trim()).filter(Boolean) : [],
        interests: form.interests ? form.interests.split(",").map(s => s.trim()).filter(Boolean) : [],
      };

      let saved;
      if (exists) {
        saved = await profileAPI.update(resumeId, payload, photo);
      } else {
        saved = await profileAPI.create(resumeId, payload, photo);
        setExists(true);
      }
      setData(saved);
      onNotify("Profile saved ✓");
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SectionLoader/>;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <ErrorBox msg={error}/>

      {/* Photo */}
      <div style={{
        display:"flex", alignItems:"center", gap:16, marginBottom:20,
        padding:"14px 16px", background:"#FAFAF8",
        border:"1.5px solid #E5E3DE", borderRadius:12,
      }}>
        <div style={{
          width:60, height:60, borderRadius:"50%",
          background:"#E5E3DE", overflow:"hidden", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {data?.profilePhotoUrl
            ? <img src={data.profilePhotoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            : <span style={{ fontSize:22 }}>👤</span>
          }
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#1C1C1C", marginBottom:4 }}>
            Profile Photo
          </div>
          <input
            type="file" accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0] || null)}
            style={{ fontSize:11, color:"#5A5550" }}
          />
          <div style={{ fontSize:10, color:"#8A8578", marginTop:3 }}>
            Max 5MB · JPG, PNG, WebP
          </div>
        </div>
      </div>

      <FormGrid cols={2}>
        <Field label="Full Name" required>
          <Input value={form.fullName} onChange={(v) => set("fullName", v)} placeholder="e.g. Alexandra Chen"/>
        </Field>
        <Field label="Display Name" hint="Shown publicly on portfolio">
          <Input value={form.displayName} onChange={(v) => set("displayName", v)} placeholder="e.g. Alex Chen"/>
        </Field>
        <Field label="Email" required>
          <Input value={form.email} onChange={(v) => set("email", v)} placeholder="hello@you.com" type="email"/>
        </Field>
        <Field label="Professional Title">
          <Input value={form.professionalTitle} onChange={(v) => set("professionalTitle", v)} placeholder="e.g. Senior Designer"/>
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210"/>
        </Field>
        <Field label="WhatsApp">
          <Input value={form.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="+91 98765 43210"/>
        </Field>
        <Field label="Date of Birth" hint="Format: YYYY-MM-DD">
          <Input value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} placeholder="1995-06-15" type="date"/>
        </Field>
        <Field label="Gender">
          <Select value={form.gender} onChange={(v) => set("gender", v)} options={GENDER_OPTIONS} placeholder="Select gender"/>
        </Field>
        <Field label="Nationality">
          <Input value={form.nationality} onChange={(v) => set("nationality", v)} placeholder="e.g. Indian"/>
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. Mumbai, India"/>
        </Field>
        <Field label="Availability Status">
          <Select value={form.availabilityStatus} onChange={(v) => set("availabilityStatus", v)} options={AVAILABILITY} placeholder="Select status"/>
        </Field>
      </FormGrid>

      <Field label="Short Bio" hint="2-3 sentences shown at the top of your portfolio">
        <Textarea value={form.bio} onChange={(v) => set("bio", v)} placeholder="A passionate designer with 5 years of experience…" rows={2}/>
      </Field>
      <Field label="Detailed Bio" hint="Full story shown on your About section">
        <Textarea value={form.detailedBio} onChange={(v) => set("detailedBio", v)} placeholder="Tell your full story here…" rows={4}/>
      </Field>
      <Field label="Achievements Summary" hint="Key career highlights — 1 sentence each">
        <Textarea value={form.achievementsSummary} onChange={(v) => set("achievementsSummary", v)} placeholder="Led a team of 12, grew revenue by 40%…" rows={2}/>
      </Field>

      <FormGrid cols={2}>
        <Field label="LinkedIn URL">
          <Input value={form.linkedinUrl} onChange={(v) => set("linkedinUrl", v)} placeholder="https://linkedin.com/in/you"/>
        </Field>
        <Field label="GitHub URL">
          <Input value={form.githubUrl} onChange={(v) => set("githubUrl", v)} placeholder="https://github.com/you"/>
        </Field>
        <Field label="Hobbies" hint="Comma-separated">
          <Input value={form.hobbies} onChange={(v) => set("hobbies", v)} placeholder="Photography, Hiking, Music"/>
        </Field>
        <Field label="Interests" hint="Comma-separated">
          <Input value={form.interests} onChange={(v) => set("interests", v)} placeholder="AI, Design Systems, Travel"/>
        </Field>
      </FormGrid>

      <FormActions onSave={handleSave} saving={saving} saveLabel={exists ? "Update Profile" : "Create Profile"}/>
    </div>
  );
}