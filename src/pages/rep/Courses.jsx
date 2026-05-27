import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const C = {
  bg:      "#0f0f0f",
  surface: "#1a1a1a",
  border:  "#2e2e2e",
  accent:  "#6366f1",
  text:    "#ffffff",
  muted:   "#9CA3AF",
  error:   "#ef4444",
};

const card = {
  background: "#1a1a1a",
  borderRadius: 14,
  border: "1px solid #2e2e2e",
};

const input = {
  width: "100%",
  padding: "10px 14px",
  background: "#0f0f0f",
  border: "1px solid #2e2e2e",
  borderRadius: 8,
  fontSize: 13,
  color: "#ffffff",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function Courses() {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: "", code: "", description: "" });
  const [error,    setError]    = useState("");
  const [saving,   setSaving]   = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/courses/");
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", code: "", description: "" });
    setError("");
    setShowModal(true);
  }

  function openEdit(course) {
    setEditing(course);
    setForm({ name: course.name, code: course.code, description: course.description });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/courses/${editing.id}/`, form);
      } else {
        await api.post("/courses/", form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}/`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Courses</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Manage your courses</div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={openAdd}
            style={{
              padding: "10px 18px", background: C.accent,
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >+ Add Course</button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
        ) : courses.length === 0 ? (
          <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No courses yet. Add one!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {courses.map((c) => (
              <div key={c.id} style={{ ...card, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{
                    padding: "4px 10px", borderRadius: 6,
                    background: "#1e1b4b", border: "1px solid #3730a3",
                    fontSize: 11, fontWeight: 700, color: C.accent,
                  }}>{c.code}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => openEdit(c)}
                      style={{
                        padding: "4px 10px", borderRadius: 6,
                        border: "1px solid #2e2e2e", background: "transparent",
                        fontSize: 11, color: C.muted, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{
                        padding: "4px 10px", borderRadius: 6,
                        border: "1px solid #3d1515", background: "transparent",
                        fontSize: 11, color: C.error, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >Delete</button>
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, minHeight: 36 }}>
                  {c.description || "No description"}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    📄 {c.handout_count} handout{c.handout_count !== 1 ? "s" : ""}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: c.is_active ? "#4ade80" : C.muted,
                  }}>
                    {c.is_active ? "● Active" : "● Inactive"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50,
        }}>
          <div style={{ ...card, padding: 28, width: "100%", maxWidth: 440 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>
              {editing ? "Edit Course" : "Add Course"}
            </div>

            {error && (
              <div style={{
                background: "#2d1414", border: `1px solid ${C.error}`,
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: C.error, marginBottom: 16,
              }}>{error}</div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Course Name</label>
              <input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Introduction to Chemistry" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Course Code</label>
              <input style={input} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CHM101" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Description (optional)</label>
              <textarea
                style={{ ...input, resize: "vertical", minHeight: 80 }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 8,
                  border: "1px solid #2e2e2e", background: "transparent",
                  fontSize: 13, color: C.muted, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: "10px", borderRadius: 8,
                  border: "none", background: C.accent,
                  fontSize: 13, fontWeight: 600, color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  fontFamily: "inherit",
                }}
              >{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}