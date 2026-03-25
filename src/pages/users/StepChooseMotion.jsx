const MOTION_PRESETS = [
  ["NONE", "Still", "Best for formal professional portfolios and low-distraction reading."],
  ["SUBTLE", "Subtle", "Gentle reveal animations and polished transitions."],
  ["EDITORIAL", "Editorial", "Smooth staggered sections for writer and designer portfolios."],
  ["PLAYFUL", "Playful", "More energetic hover and entrance movement."],
  ["CINEMATIC", "Cinematic", "Best for photography and story-led visual work."],
  ["PARALLAX", "Parallax", "Depth and motion for immersive landing pages."],
  ["SLIDESHOW", "Slideshow", "Works well for gallery-first templates."],
  ["IMMERSIVE", "Immersive", "High-impact motion for premium showcase experiences."],
];

export default function StepChooseMotion({ cfg, set }) {
  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={s.infoBox}>
        Motion is layered on top of the layout. It controls how the site feels, not which content it shows.
      </div>
      <div style={s.grid}>
        {MOTION_PRESETS.map(([value, label, description]) => {
          const active = (cfg.motionPreset || "SUBTLE") === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => set("motionPreset", value)}
              style={{ ...s.card, border: active ? "2px solid #1C1C1C" : "1px solid #E5E3DE", background: active ? "linear-gradient(180deg, #FFFEFC 0%, #F5EEDF 100%)" : "#fff" }}
            >
              <div style={s.headerRow}>
                <div style={s.title}>{label}</div>
                <div style={{ ...s.dot, background: active ? "#1C1C1C" : "#DDD2C2" }} />
              </div>
              <div style={s.code}>{value}</div>
              <p style={s.description}>{description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  infoBox: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "#F7F4EE",
    border: "1px solid #E9E1D4",
    fontSize: 11,
    color: "#5C5348",
    marginBottom: 14,
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.45,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  card: {
    textAlign: "left",
    borderRadius: 16,
    padding: 14,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(28,28,28,0.05)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1C1C1C",
    fontFamily: "'DM Sans', sans-serif",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  code: {
    fontSize: 10,
    color: "#8A8578",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  description: {
    margin: 0,
    fontSize: 11,
    color: "#72685D",
    lineHeight: 1.5,
    fontFamily: "'DM Sans', sans-serif",
  },
};
