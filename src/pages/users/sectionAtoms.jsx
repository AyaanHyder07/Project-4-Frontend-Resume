/**
 * sectionAtoms.jsx
 * Shared UI atoms used across all section components.
 * Import these in every section component.
 */

import { Loader2, Trash2, Pencil, Plus, GripVertical, X, Check } from "lucide-react";

/* ── Base input style ─────────────────────────────────────────── */
export const iBase = {
  width: "100%",
  border: "1.5px solid #E5E3DE",
  borderRadius: 9,
  padding: "9px 12px",
  fontSize: 12.5,
  color: "#1C1C1C",
  outline: "none",
  background: "#FAFAF8",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.15s",
  display: "block",
  boxSizing: "border-box",
};

/* ── Form field ───────────────────────────────────────────────── */
export function Field({ label, required, hint, children, style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <div style={{
          fontSize: 11.5, fontWeight: 700, color: "#1C1C1C",
          marginBottom: 3, fontFamily: "'DM Sans',sans-serif",
        }}>
          {label}
          {required && <span style={{ color: "#B43C3C", marginLeft: 2 }}>*</span>}
        </div>
      )}
      {hint && (
        <div style={{
          fontSize: 10, color: "#8A8578", marginBottom: 5,
          fontFamily: "'DM Sans',sans-serif",
        }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Input ────────────────────────────────────────────────────── */
export function Input({ value, onChange, placeholder, type = "text", disabled, style = {} }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        ...iBase,
        borderColor: value ? "#1C1C1C" : "#E5E3DE",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
}

/* ── Textarea ─────────────────────────────────────────────────── */
export function Textarea({ value, onChange, placeholder, rows = 3, style = {} }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...iBase,
        resize: "vertical",
        borderColor: value ? "#1C1C1C" : "#E5E3DE",
        ...style,
      }}
    />
  );
}

/* ── Select ───────────────────────────────────────────────────── */
export function Select({ value, onChange, options, placeholder, style = {} }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...iBase,
        cursor: "pointer",
        appearance: "auto",
        ...style,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

/* ── Toggle ───────────────────────────────────────────────────── */
export function Toggle({ val, onChange, label, sub }) {
  return (
    <div
      onClick={() => onChange(!val)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 13px", borderRadius: 10, cursor: "pointer",
        background: val ? "#1C1C1C" : "#F0EDE6",
        border: `1.5px solid ${val ? "#1C1C1C" : "#E5E3DE"}`,
        transition: "all 0.18s", marginBottom: 8,
      }}
    >
      <div>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: val ? "#F0EDE6" : "#1C1C1C",
          fontFamily: "'DM Sans',sans-serif",
        }}>{label}</div>
        {sub && (
          <div style={{
            fontSize: 10, color: val ? "rgba(240,237,230,0.6)" : "#8A8578",
            fontFamily: "'DM Sans',sans-serif",
          }}>{sub}</div>
        )}
      </div>
      <div style={{
        width: 34, height: 18, borderRadius: 9,
        background: val ? "rgba(255,255,255,0.3)" : "#D5D3CE",
        position: "relative", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2,
          left: val ? 16 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: "#fff", transition: "left 0.18s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}/>
      </div>
    </div>
  );
}

/* ── File upload button ───────────────────────────────────────── */
export function FileUpload({ label, accept, onChange, currentUrl, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <div style={{
          fontSize: 11.5, fontWeight: 700, color: "#1C1C1C",
          marginBottom: 5, fontFamily: "'DM Sans',sans-serif",
        }}>{label}</div>
      )}
      {hint && (
        <div style={{ fontSize: 10, color: "#8A8578", marginBottom: 5, fontFamily:"'DM Sans',sans-serif" }}>
          {hint}
        </div>
      )}
      {currentUrl && (
        <div style={{
          fontSize: 10, color: "#4A6FA5", background: "#F0F4F8",
          padding: "4px 9px", borderRadius: 6, marginBottom: 6,
          fontFamily: "monospace", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          ✓ File uploaded
        </div>
      )}
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0] || null)}
        style={{ fontSize: 11.5, fontFamily: "'DM Sans',sans-serif", color: "#5A5550" }}
      />
    </div>
  );
}

/* ── Save / Cancel buttons ────────────────────────────────────── */
export function FormActions({ onSave, onCancel, saving, saveLabel = "Save" }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6,
          background: "#1C1C1C", color: "#F0EDE6",
          border: "none", borderRadius: 9,
          padding: "10px 0", fontSize: 12.5,
          fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "'DM Sans',sans-serif",
          opacity: saving ? 0.7 : 1, transition: "opacity 0.15s",
        }}
      >
        {saving
          ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> Saving…</>
          : <><Check size={13}/> {saveLabel}</>
        }
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            background: "#F0EDE6", color: "#5A5550",
            border: "none", borderRadius: 9,
            padding: "10px 16px", fontSize: 12.5,
            fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <X size={13}/>
        </button>
      )}
    </div>
  );
}

/* ── Item card (for list items like experience, education etc.) ── */
export function ItemCard({ children, onEdit, onDelete, deleting }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #E5E3DE",
      borderRadius: 12, padding: "13px 15px", marginBottom: 10,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {onEdit && (
            <button onClick={onEdit} style={iconBtn("#F0EDE6", "#1C1C1C")}>
              <Pencil size={12}/>
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} disabled={deleting} style={iconBtn("rgba(180,60,60,0.08)", "#B43C3C")}>
              {deleting
                ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }}/>
                : <Trash2 size={12}/>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Add new button ───────────────────────────────────────────── */
export function AddBtn({ onClick, label = "Add New" }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 7,
        border: "2px dashed #D5D3CE", borderRadius: 11,
        background: "transparent", padding: "11px 0",
        fontSize: 12.5, fontWeight: 600, color: "#8A8578",
        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.15s", marginTop: 4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#1C1C1C";
        e.currentTarget.style.color = "#1C1C1C";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#D5D3CE";
        e.currentTarget.style.color = "#8A8578";
      }}
    >
      <Plus size={14}/> {label}
    </button>
  );
}

/* ── Section loading state ────────────────────────────────────── */
export function SectionLoader() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "48px 0", gap: 10,
    }}>
      <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#7B3FA0" }}/>
      <span style={{ fontSize: 12, color: "#8A8578", fontFamily: "'DM Sans',sans-serif" }}>
        Loading…
      </span>
    </div>
  );
}

/* ── Empty section state ──────────────────────────────────────── */
export function SectionEmpty({ emoji, title, subtitle, onAdd }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "48px 24px",
      border: "2px dashed #E5E3DE", borderRadius: 14,
      background: "#FAFAF8", textAlign: "center",
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{emoji}</div>
      <div style={{
        fontSize: 14, fontWeight: 700, color: "#1C1C1C",
        fontFamily: "'DM Serif Display',serif", marginBottom: 5,
      }}>{title}</div>
      <div style={{
        fontSize: 11.5, color: "#8A8578",
        fontFamily: "'DM Sans',sans-serif", marginBottom: 16,
        maxWidth: 280, lineHeight: 1.5,
      }}>{subtitle}</div>
      {onAdd && <AddBtn onClick={onAdd} label="Add First Entry"/>}
    </div>
  );
}

/* ── Error box ────────────────────────────────────────────────── */
export function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: "9px 13px", borderRadius: 9, marginBottom: 12,
      background: "rgba(180,60,60,0.08)",
      border: "1px solid rgba(180,60,60,0.2)",
      fontSize: 11.5, color: "#B43C3C",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      ⚠ {msg}
    </div>
  );
}

/* ── Grid layout for form fields ──────────────────────────────── */
export function FormGrid({ cols = 2, children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "0 14px",
    }}>
      {children}
    </div>
  );
}

const iconBtn = (bg, color) => ({
  background: bg, color, border: "none",
  borderRadius: 7, padding: "5px 7px",
  cursor: "pointer", display: "flex", alignItems: "center",
  transition: "opacity 0.15s",
});