/**
 * StepBasicInfo.jsx
 * Step 1 of Resume Creation Studio
 * Fields: title, professionType
 * Matches CreateResumeRequest: { templateId, title, professionType, themeOverrideId? }
 * This step handles: title + professionType
 */

const PROFESSION_SUGGESTIONS = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Product Designer",
  "Graphic Designer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "Marketing Manager",
  "Content Creator",
  "Photographer",
  "Videographer",
  "Illustrator",
  "Motion Designer",
  "Architect",
  "Civil Engineer",
  "Mechanical Engineer",
  "Financial Analyst",
  "Investment Banker",
  "Consultant",
  "Doctor",
  "Nurse",
  "Therapist",
  "Lawyer",
  "Researcher",
  "Academic",
  "Freelancer",
  "Entrepreneur",
  "Founder",
  "Coach",
  "Speaker",
  "Student",
];

const TITLE_EXAMPLES = [
  "My Creative Portfolio",
  "Professional Resume 2024",
  "Design & Development Portfolio",
  "Senior Engineer Portfolio",
  "Full Stack Developer Resume",
  "Photography Portfolio",
  "UX Design Showcase",
  "Data Science Portfolio",
];

const iBase = {
  width: "100%",
  border: "1.5px solid #E5E3DE",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 13,
  color: "#1C1C1C",
  outline: "none",
  background: "#FAFAF8",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.18s",
  display: "block",
  boxSizing: "border-box",
};

export default function StepBasicInfo({ cfg, set }) {
  const filtered = cfg.professionType
    ? PROFESSION_SUGGESTIONS.filter((p) =>
        p.toLowerCase().includes(cfg.professionType.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      {/* Title */}
      <div style={{ marginBottom: 22 }}>
        <div style={s.label}>
          Portfolio Title <span style={{ color: "#B43C3C" }}>*</span>
        </div>
        <div style={s.hint}>Give your portfolio a unique name</div>
        <input
          value={cfg.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder='e.g. "My Creative Portfolio"'
          maxLength={80}
          style={{
            ...iBase,
            fontSize: 14,
            fontWeight: 500,
            borderColor: cfg.title ? "#1C1C1C" : "#E5E3DE",
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {TITLE_EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => set("title", ex)}
              style={{
                ...s.chip,
                background: cfg.title === ex ? "#1C1C1C" : "#F0EDE6",
                color: cfg.title === ex ? "#F0EDE6" : "#5A5550",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
        <div style={s.charCount}>{cfg.title.length}/80</div>
      </div>

      {/* Profession Type */}
      <div style={{ marginBottom: 8 }}>
        <div style={s.label}>
          Your Profession <span style={{ color: "#B43C3C" }}>*</span>
        </div>
        <div style={s.hint}>
          This helps us recommend the right templates for you
        </div>
        <div style={{ position: "relative" }}>
          <input
            value={cfg.professionType}
            onChange={(e) => set("professionType", e.target.value)}
            placeholder='e.g. "Software Engineer", "Photographer"…'
            style={{
              ...iBase,
              borderColor: cfg.professionType ? "#1C1C1C" : "#E5E3DE",
            }}
          />
          {/* Autocomplete dropdown */}
          {filtered.length > 0 && cfg.professionType.length > 1 && (
            <div style={s.dropdown}>
              {filtered.map((p) => (
                <div
                  key={p}
                  onClick={() => set("professionType", p)}
                  style={s.dropItem}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0EDE6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular professions grid */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "#8A8578", marginBottom: 7, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Popular choices
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              "Software Engineer", "UI/UX Designer", "Photographer",
              "Product Manager", "Data Scientist", "Freelancer",
              "Architect", "Content Creator", "Consultant", "Doctor",
            ].map((p) => (
              <button
                key={p}
                onClick={() => set("professionType", p)}
                style={{
                  ...s.chip,
                  background: cfg.professionType === p ? "#1C1C1C" : "#F0EDE6",
                  color: cfg.professionType === p ? "#F0EDE6" : "#5A5550",
                  fontSize: 11,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation hint */}
      {(!cfg.title.trim() || !cfg.professionType.trim()) && (
        <div style={s.warn}>
          ⚡ Both title and profession are required to continue
        </div>
      )}
    </div>
  );
}

const s = {
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1C1C1C",
    marginBottom: 3,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "-0.01em",
  },
  hint: {
    fontSize: 10.5,
    color: "#8A8578",
    marginBottom: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  chip: {
    border: "none",
    borderRadius: 20,
    padding: "4px 11px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  charCount: {
    fontSize: 9.5,
    color: "#B0AB9E",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "'DM Sans', sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid #E5E3DE",
    borderRadius: 10,
    zIndex: 50,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  dropItem: {
    padding: "9px 14px",
    fontSize: 12,
    color: "#1C1C1C",
    cursor: "pointer",
    transition: "background 0.12s",
    fontFamily: "'DM Sans', sans-serif",
  },
  warn: {
    marginTop: 14,
    padding: "9px 13px",
    borderRadius: 9,
    background: "rgba(180,60,60,0.07)",
    border: "1px solid rgba(180,60,60,0.18)",
    fontSize: 11,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
};