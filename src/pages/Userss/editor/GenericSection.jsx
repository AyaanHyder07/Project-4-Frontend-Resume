/**
 * GenericSection — reusable CRUD list for any resume section.
 *
 * Props:
 *  title        string          — section heading
 *  items        array           — current list of items
 *  fields       array           — [{ name, label, type?, options? }]
 *  onCreate     fn(form)        — called on add
 *  onUpdate     fn(id, form)    — called on save edit
 *  onDelete     fn(id)          — called on delete
 *  loading      bool
 */
import { useState } from "react";

const emptyForm = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});

const GenericSection = ({
  title, items = [], fields = [],
  onCreate, onUpdate, onDelete, loading,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm(fields));
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    setSaving(true);
    onCreate(addForm)
      .then(() => { setShowAdd(false); setAddForm(emptyForm(fields)); })
      .catch(() => alert("Failed to add."))
      .finally(() => setSaving(false));
  };

  const handleUpdate = () => {
    setSaving(true);
    onUpdate(editId, editForm)
      .then(() => { setEditId(null); setEditForm({}); })
      .catch(() => alert("Failed to update."))
      .finally(() => setSaving(false));
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditForm({ ...item });
  };

  const renderField = (f, form, setForm) => (
    <div key={f.name} style={{ marginBottom: "0.4rem" }}>
      <label>{f.label}</label><br />
      {f.type === "textarea" ? (
        <textarea
          value={form[f.name] || ""}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
          rows={2}
          style={{ width: "100%" }}
        />
      ) : f.type === "select" ? (
        <select
          value={form[f.name] || ""}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
        >
          <option value="">— select —</option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : f.type === "checkbox" ? (
        <input
          type="checkbox"
          checked={!!form[f.name]}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
        />
      ) : (
        <input
          type={f.type || "text"}
          value={form[f.name] || ""}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
          style={{ width: "100%" }}
        />
      )}
    </div>
  );

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>{title}</h3>
        <button onClick={() => setShowAdd(!showAdd)}>+ Add</button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ border: "1px solid #ccc", padding: "0.75rem", marginBottom: "0.75rem" }}>
          <h4>Add {title}</h4>
          {fields.map((f) => renderField(f, addForm, setAddForm))}
          <button onClick={handleAdd} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => setShowAdd(false)} style={{ marginLeft: "0.5rem" }}>
            Cancel
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {/* Items List */}
      {items.length === 0 && !loading && <p>No {title.toLowerCase()} added yet.</p>}

      {items.map((item) => (
        <div key={item.id} style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.5rem" }}>
          {editId === item.id ? (
            <div>
              {fields.map((f) => renderField(f, editForm, setEditForm))}
              <button onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving..." : "Update"}
              </button>
              <button onClick={() => setEditId(null)} style={{ marginLeft: "0.5rem" }}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                {/* Show first 2 meaningful fields as preview */}
                {fields.slice(0, 2).map((f) => (
                  <div key={f.name}>
                    <strong>{f.label}:</strong>{" "}
                    {f.type === "checkbox"
                      ? item[f.name] ? "Yes" : "No"
                      : item[f.name] || "—"}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => startEdit(item)}>Edit</button>
                <button onClick={() => onDelete(item.id)} style={{ color: "red" }}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GenericSection;