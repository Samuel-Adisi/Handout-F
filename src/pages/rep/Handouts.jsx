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

export default function Handouts() {
  const [handouts,   setHandouts]   = useState([]);
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState({ title: "", description: "", course_id: "", price: "", stock: "" });
  const [error,      setError]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  async function load() {
    try {
      const [handoutsRes, coursesRes] = await Promise.all([
        api.get("/handouts/"),
        api.get("/courses/"),
      ]);
      setHandouts(handoutsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ title: "", description: "", course_id: "", price: "", stock: "" });
    setError("");
    setShowModal(true);
  }

  function openEdit(h) {
    setEditing(h);
    setForm({
      title:       h.title,
      description: h.description,
      course_id:   h.course?.id,
      price:       h.price,
      stock:       h.stock,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/handouts/${editing.id}/`, form);
      } else {
        await api.post("/handouts/", form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      const errs = err.response?.data;
      setError(typeof errs === "string" ? errs : JSON.stringify(errs));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this handout?")) return;
    try {
      await api.delete(`/handouts/${id}/`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = handouts.filter((h) => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse ? h.course?.id === parseInt(filterCourse) : true;
    return matchSearch && matchCourse;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Handouts</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Manage your handouts</div>
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
          >+ Add Handout</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search handouts..."
            style={{ ...input, width: 240 }}
          />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            style={{ ...input, width: 200 }}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No handouts found.</div>
        ) : (
          <div style={{ ...card }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#141414" }}>
                  {["Title", "Course", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} style={{ borderTop: "1px solid #2e2e2e" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{h.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{h.description?.slice(0, 50)}</div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 6,
                        background: "#1e1b4b", border: "1px solid #3730a3",
                        fontSize: 11, fontWeight: 700, color: C.accent,
                      }}>{h.course?.code}</span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: C.text }}>
                      GHS {h.price}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: h.stock > 10 ? "#4ade80" : h.stock > 0 ? "#fbbf24" : "#f87171",
                      }}>{h.stock}</span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 6,
                        fontSize: 11, fontWeight: 600,
                        color: h.is_active ? "#4ade80" : C.muted,
                        background: h.is_active ? "#052e16" : "#1a1a1a",
                      }}>
                        {h.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(h)}
                          style={{
                            padding: "4px 12px", borderRadius: 6,
                            border: "1px solid #2e2e2e", background: "transparent",
                            fontSize: 11, color: C.muted, cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          style={{
                            padding: "4px 12px", borderRadius: 6,
                            border: "1px solid #3d1515", background: "transparent",
                            fontSize: 11, color: C.error, cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {editing ? "Edit Handout" : "Add Handout"}
            </div>

            {error && (
              <div style={{
                background: "#2d1414", border: `1px solid ${C.error}`,
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: C.error, marginBottom: 16,
              }}>{error}</div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Title</label>
              <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. CHM101 Week 1 Notes" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Course</label>
              <select
                style={input}
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Description</label>
              <textarea
                style={{ ...input, resize: "vertical", minHeight: 70 }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Price (GHS)</label>
                <input style={input} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5.00" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Stock</label>
                <input style={input} type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" />
              </div>
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