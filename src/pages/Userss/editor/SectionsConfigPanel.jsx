import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { sectionAPI } from "../../../api/endpoints";

/* ─── Sortable Row ─── */
const SortableRow = ({ section, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    border: "1px solid #ddd",
    marginBottom: "0.25rem",
    background: "#fff",
    cursor: "default",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle */}
      <span {...attributes} {...listeners} style={{ cursor: "grab" }}>
        <GripVertical size={16} />
      </span>

      <input
        type="checkbox"
        checked={section.enabled}
        onChange={() => onToggle(section)}
      />
      <span>{section.sectionName}</span>
    </div>
  );
};

/* ─── Main Component ─── */
const SectionsConfigPanel = ({ resumeId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    sectionAPI
      .getSections(resumeId)
      .then((res) => setSections(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resumeId]);

  /* Toggle enabled */
  const handleToggle = (section) => {
    const updated = sections.map((s) =>
      s.id === section.id ? { ...s, enabled: !s.enabled } : s
    );
    setSections(updated);

    sectionAPI
      .update(section.id, { enabled: !section.enabled })
      .catch(() => {});
  };

  /* DnD reorder */
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    // Save order to backend
    setSaving(true);
    sectionAPI
      .reorder(resumeId, reordered.map((s) => s.id))
      .then(() => setMsg("Order saved."))
      .catch(() => setMsg("Failed to save order."))
      .finally(() => setSaving(false));
  };

  if (loading) return <p>Loading sections...</p>;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Section Order & Visibility</h3>
        {saving && <small>Saving...</small>}
        {msg && <small>{msg}</small>}
      </div>
      <p style={{ fontSize: "0.85rem", color: "#555" }}>
        Drag to reorder. Toggle checkbox to show/hide on public portfolio.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((s) => (
            <SortableRow key={s.id} section={s} onToggle={handleToggle} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionsConfigPanel;