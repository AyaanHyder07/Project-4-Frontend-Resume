const PROFESSION_GROUPS = [
  {
    category: "TECH_ENGINEERING",
    label: "Tech & Engineering",
    professions: [
      ["SOFTWARE_ENGINEER", "Software Engineer"],
      ["FRONTEND_DEVELOPER", "Frontend Developer"],
      ["BACKEND_DEVELOPER", "Backend Developer"],
      ["FULL_STACK_DEVELOPER", "Full Stack Developer"],
      ["DATA_SCIENTIST", "Data Scientist"],
      ["DEVOPS_ENGINEER", "DevOps Engineer"],
    ],
  },
  {
    category: "DESIGN_CREATIVE",
    label: "Design & Creative",
    professions: [
      ["UX_DESIGNER", "UX Designer"],
      ["UI_DESIGNER", "UI Designer"],
      ["GRAPHIC_DESIGNER", "Graphic Designer"],
      ["BRAND_DESIGNER", "Brand Designer"],
      ["ILLUSTRATOR", "Illustrator"],
      ["MOTION_DESIGNER", "Motion Designer"],
    ],
  },
  {
    category: "PHOTOGRAPHY_FILM",
    label: "Photo & Film",
    professions: [
      ["PHOTOGRAPHER", "Photographer"],
      ["VIDEOGRAPHER", "Videographer"],
      ["FILMMAKER", "Filmmaker"],
    ],
  },
  {
    category: "WRITING_PUBLISHING",
    label: "Writing & Publishing",
    professions: [
      ["WRITER", "Writer"],
      ["JOURNALIST", "Journalist"],
      ["CONTENT_STRATEGIST", "Content Strategist"],
    ],
  },
  {
    category: "FINANCE_BUSINESS",
    label: "Business & Consulting",
    professions: [
      ["BUSINESS_CONSULTANT", "Consultant"],
      ["PRODUCT_MANAGER", "Product Manager"],
      ["ACCOUNTANT", "Accountant"],
      ["FINANCIAL_ANALYST", "Financial Analyst"],
    ],
  },
  {
    category: "EDUCATION_RESEARCH",
    label: "Research & Academic",
    professions: [
      ["RESEARCHER", "Researcher"],
      ["PROFESSOR", "Professor"],
      ["TEACHER", "Teacher"],
    ],
  },
  {
    category: "HEALTHCARE_MEDICAL",
    label: "Healthcare",
    professions: [
      ["DOCTOR", "Doctor"],
      ["NURSE", "Nurse"],
      ["THERAPIST", "Therapist"],
    ],
  },
];

const TITLE_EXAMPLES = [
  "Modern professional portfolio",
  "Case-study portfolio",
  "Cinematic portfolio",
  "Minimal consulting profile",
  "Editorial personal site",
  "Creative work archive",
];

const ALL_PROFESSIONS = PROFESSION_GROUPS.flatMap((group) => group.professions.map(([value, label]) => ({
  value,
  label,
  category: group.category,
  categoryLabel: group.label,
})));

const inputBase = {
  width: "100%",
  border: "1.5px solid #E5E3DE",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 13,
  color: "#1C1C1C",
  outline: "none",
  background: "#FAFAF8",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
};

export default function StepBasicInfo({ cfg, set }) {
  const selectedProfession = ALL_PROFESSIONS.find((item) => item.value === cfg.professionType);

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={s.label}>Portfolio Title <span style={{ color: "#B43C3C" }}>*</span></div>
        <div style={s.hint}>This becomes the working name inside your dashboard.</div>
        <input
          value={cfg.title}
          onChange={(event) => set("title", event.target.value)}
          placeholder="e.g. Rohan Das portfolio"
          maxLength={80}
          style={{ ...inputBase, borderColor: cfg.title ? "#1C1C1C" : "#E5E3DE" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {TITLE_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => set("title", example)}
              style={{ ...s.chip, background: cfg.title === example ? "#1C1C1C" : "#F0EDE6", color: cfg.title === example ? "#F7F2E8" : "#5A5550" }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={s.label}>Profession <span style={{ color: "#B43C3C" }}>*</span></div>
        <div style={s.hint}>Choose the closest profession so we can recommend the strongest templates for this portfolio.</div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {PROFESSION_GROUPS.map((group) => (
          <section key={group.category} style={s.groupCard}>
            <div style={s.groupHeading}>{group.label}</div>
            <div style={s.chipGrid}>
              {group.professions.map(([value, label]) => {
                const active = cfg.professionType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("professionType", value)}
                    style={{
                      ...s.selectChip,
                      background: active ? "#1C1C1C" : "#fff",
                      color: active ? "#F7F2E8" : "#2A241E",
                      borderColor: active ? "#1C1C1C" : "#E5E3DE",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selectedProfession ? (
        <div style={s.selectionSummary}>
          <div style={s.summaryTitle}>Selected direction</div>
          <div style={s.summaryValue}>{selectedProfession.label}</div>
          <div style={s.summaryMeta}>Category: {selectedProfession.categoryLabel}</div>
          <div style={s.summaryMeta}>Next we’ll show the templates that fit this profession first, then the wider catalog below.</div>
        </div>
      ) : (
        <div style={s.warn}>Choose a profession to unlock recommendations in the next step.</div>
      )}
    </div>
  );
}

const s = {
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1C1C1C",
    marginBottom: 4,
    fontFamily: "'DM Sans', sans-serif",
  },
  hint: {
    fontSize: 10.5,
    color: "#8A8578",
    marginBottom: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  chip: {
    border: "none",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  groupCard: {
    border: "1px solid #ECE6DA",
    borderRadius: 16,
    background: "linear-gradient(180deg, #FFFEFC 0%, #F8F3EB 100%)",
    padding: 14,
  },
  groupHeading: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#8A8578",
    fontWeight: 700,
    marginBottom: 10,
    fontFamily: "'DM Sans', sans-serif",
  },
  chipGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  selectChip: {
    border: "1px solid #E5E3DE",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 11.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.18s ease",
  },
  selectionSummary: {
    marginTop: 16,
    borderRadius: 14,
    background: "#EEF6FF",
    border: "1px solid #CFE2FF",
    padding: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  summaryTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#5779A3",
    fontWeight: 700,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1C1C1C",
    marginBottom: 4,
  },
  summaryMeta: {
    fontSize: 11,
    color: "#607086",
    lineHeight: 1.45,
  },
  warn: {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(180,60,60,0.08)",
    border: "1px solid rgba(180,60,60,0.18)",
    fontSize: 11.2,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
};
