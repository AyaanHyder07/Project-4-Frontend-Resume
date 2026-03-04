import { useEffect, useState } from "react";
import { profileAPI } from "../../../api/endpoints";

const ProfileSection = ({ resumeId }) => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "", headline: "", bio: "", email: "",
    phone: "", location: "", website: "", avatarUrl: "",
    linkedinUrl: "", githubUrl: "", twitterUrl: "",
  });
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    profileAPI.getPrivate(resumeId)
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
        setExists(true);
      })
      .catch(() => setExists(false));
  }, [resumeId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    setSaving(true);
    const call = exists
      ? profileAPI.update(resumeId, form)
      : profileAPI.create({ ...form, resumeId });

    call
      .then((res) => { setProfile(res.data); setExists(true); setMsg("Saved!"); })
      .catch(() => setMsg("Error saving."))
      .finally(() => setSaving(false));
  };

  const fields = [
    { name: "fullName",    label: "Full Name" },
    { name: "headline",    label: "Headline" },
    { name: "bio",         label: "Bio",        textarea: true },
    { name: "email",       label: "Email" },
    { name: "phone",       label: "Phone" },
    { name: "location",    label: "Location" },
    { name: "website",     label: "Website" },
    { name: "avatarUrl",   label: "Avatar URL" },
    { name: "linkedinUrl", label: "LinkedIn URL" },
    { name: "githubUrl",   label: "GitHub URL" },
    { name: "twitterUrl",  label: "Twitter URL" },
  ];

  return (
    <div>
      <h3>Profile</h3>
      {fields.map((f) => (
        <div key={f.name} style={{ marginBottom: "0.5rem" }}>
          <label>{f.label}</label><br />
          {f.textarea ? (
            <textarea
              name={f.name}
              value={form[f.name] || ""}
              onChange={handleChange}
              rows={3}
              style={{ width: "100%" }}
            />
          ) : (
            <input
              name={f.name}
              value={form[f.name] || ""}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          )}
        </div>
      ))}
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : exists ? "Update Profile" : "Create Profile"}
      </button>
      {msg && <span style={{ marginLeft: "0.5rem" }}>{msg}</span>}
    </div>
  );
};

export default ProfileSection;