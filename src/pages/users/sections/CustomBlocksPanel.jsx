import { useEffect, useState } from "react";
import { blockAPI } from "../editorAPI";

const BLOCK_TYPES = [
  "RICH_TEXT",
  "LINK_LIST",
  "METRICS",
  "TIMELINE",
  "GALLERY",
  "CASE_STUDY",
  "QUOTE",
  "CTA",
  "FAQ",
  "EMBED",
  "PROCESS_STEPS",
  "CUSTOM_LIST",
  "STATS_GRID",
  "CLIENT_LOGOS",
  "SERVICES_GRID",
  "AVAILABILITY_CARD",
];

export default function CustomBlocksPanel({ resumeId, onNotify }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftType, setDraftType] = useState("RICH_TEXT");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const load = () => {
    setLoading(true);
    blockAPI.getAll(resumeId)
      .then((data) => setBlocks(Array.isArray(data) ? data : []))
      .catch(() => setBlocks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [resumeId]);

  const createBlock = async () => {
    if (!draftTitle.trim()) {
      onNotify?.("Block title is required.", false);
      return;
    }
    try {
      await blockAPI.create({
        resumeId,
        blockType: draftType,
        title: draftTitle.trim(),
        payload: { text: draftBody },
      });
      setDraftTitle("");
      setDraftBody("");
      onNotify?.("Custom block created.");
      load();
    } catch {
      onNotify?.("Could not create block.", false);
    }
  };

  const removeBlock = async (id) => {
    try {
      await blockAPI.delete(id);
      onNotify?.("Custom block removed.");
      load();
    } catch {
      onNotify?.("Could not remove block.", false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={s.help}>
        Use custom blocks for anything your built-in sections do not cover: process, FAQ, pricing, press, exhibitions, service grids, or rich custom notes.
      </div>

      <div style={s.createCard}>
        <select value={draftType} onChange={(event) => setDraftType(event.target.value)} style={s.input}>
          {BLOCK_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}
        </select>
        <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Block title" style={s.input} />
        <textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} placeholder="Quick content or notes for this block" rows={4} style={{ ...s.input, resize: "vertical" }} />
        <button type="button" onClick={createBlock} style={s.primaryBtn}>Add block</button>
      </div>

      {loading ? <div style={s.empty}>Loading blocks...</div> : null}
      {!loading && blocks.length === 0 ? <div style={s.empty}>No custom blocks yet.</div> : null}

      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
        {blocks.map((block) => (
          <article key={block.id} style={s.blockCard}>
            <div>
              <div style={s.blockTitle}>{block.title || block.blockType.replace(/_/g, " ")}</div>
              <div style={s.blockMeta}>{block.blockType.replace(/_/g, " ")}</div>
              {block.payload?.text ? <div style={s.blockText}>{String(block.payload.text).slice(0, 120)}</div> : null}
            </div>
            <button type="button" onClick={() => removeBlock(block.id)} style={s.deleteBtn}>Delete</button>
          </article>
        ))}
      </div>
    </div>
  );
}

const s = {
  help: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "#F7F4EE",
    border: "1px solid #E5DDD1",
    fontSize: 11,
    color: "#6E6559",
    marginBottom: 12,
    lineHeight: 1.5,
  },
  createCard: {
    border: "1px solid #E5E3DE",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
    display: "grid",
    gap: 8,
  },
  input: {
    width: "100%",
    border: "1px solid #E5E3DE",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 12,
    boxSizing: "border-box",
    background: "#FAFAF8",
    fontFamily: "inherit",
    outline: "none",
  },
  primaryBtn: {
    border: "none",
    borderRadius: 10,
    background: "#1C1C1C",
    color: "#F6EFE4",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    marginTop: 10,
    padding: "14px 12px",
    borderRadius: 10,
    background: "#FBF8F2",
    border: "1px dashed #D7CCB9",
    textAlign: "center",
    color: "#7D7468",
    fontSize: 11.5,
  },
  blockCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    border: "1px solid #E5E3DE",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
  },
  blockTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#1C1C1C",
  },
  blockMeta: {
    fontSize: 10,
    color: "#8A8578",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: 2,
    fontWeight: 700,
  },
  blockText: {
    marginTop: 8,
    fontSize: 11,
    color: "#72685D",
    lineHeight: 1.5,
  },
  deleteBtn: {
    border: "1px solid rgba(180,60,60,0.22)",
    borderRadius: 10,
    background: "rgba(180,60,60,0.06)",
    color: "#B43C3C",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
};
