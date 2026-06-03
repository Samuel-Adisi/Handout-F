import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const NAV = [
  { label: "Dashboard", path: "/rep/dashboard", icon: "⊞" },
  { label: "Courses",   path: "/rep/courses",   icon: "📚" },
  { label: "Handouts",  path: "/rep/handouts",  icon: "📄" },
  { label: "Payments",  path: "/rep/payments",  icon: "💳" },
];

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }

  .cr-shell {
    display: flex; min-height: 100vh;
    background: ${C.bg};
    font-family: system-ui, sans-serif;
  }

  /* ── SIDEBAR ── */
  .cr-sidebar {
    width: 220px; min-height: 100vh;
    background: ${C.surface}; border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh;
    flex-shrink: 0; z-index: 30;
    transition: transform 0.25s ease;
  }

  .cr-sidebar-logo {
    padding: 20px 16px; border-bottom: 1px solid ${C.border};
    display: flex; align-items: center; gap: 10px;
  }

  .cr-sidebar-icon-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: ${C.accent}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #fff;
  }

  .cr-sidebar-nav { flex: 1; padding: 12px 10px; }

  .cr-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; margin-bottom: 4px;
    cursor: pointer; font-size: 13px; transition: all 0.15s;
    border: none; background: transparent; width: 100%;
    font-family: inherit; text-align: left;
  }
  .cr-nav-item:hover { background: #2e2e2e; }
  .cr-nav-item.active { background: ${C.accent}; color: #fff; font-weight: 600; }
  .cr-nav-item.inactive { color: ${C.muted}; font-weight: 400; }

  .cr-sidebar-footer { padding: 12px 10px; border-top: 1px solid ${C.border}; }

  .cr-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; margin-bottom: 4px;
  }

  .cr-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: ${C.accent}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
  }

  .cr-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    cursor: pointer; color: #ef4444; font-size: 13px;
    border: none; background: transparent;
    font-family: inherit; width: 100%; text-align: left;
  }
  .cr-logout:hover { background: #2d1414; }

  /* ── MOBILE TOP BAR ── */
  .cr-topbar {
    display: none;
    position: sticky; top: 0; z-index: 40;
    background: ${C.surface}ee;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${C.border};
    padding: 0 16px; height: 56px;
    align-items: center; justify-content: space-between;
  }

  .cr-topbar-logo { display: flex; align-items: center; gap: 10px; }

  .cr-hamburger {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    cursor: pointer; gap: 5px; flex-shrink: 0;
  }
  .cr-hamburger span {
    display: block; width: 16px; height: 1.5px;
    background: ${C.muted}; border-radius: 2px; transition: all 0.2s;
  }

  /* mobile overlay sidebar */
  .cr-sidebar-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 50;
  }
  .cr-sidebar-overlay.open { display: block; }

  .cr-sidebar-backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.6);
  }

  .cr-sidebar-drawer {
    position: absolute; top: 0; left: 0; bottom: 0;
    width: 240px; background: ${C.surface};
    border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  .cr-sidebar-overlay.open .cr-sidebar-drawer {
    transform: translateX(0);
  }

  /* ── MAIN CONTENT ── */
  .cr-main { flex: 1; overflow-y: auto; padding: 28px 24px; min-width: 0; }

  .cr-page-header {
    display: flex; align-items: center;
    margin-bottom: 24px; gap: 12px;
  }

  .cr-add-btn {
    padding: 10px 18px; background: ${C.accent};
    color: #fff; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; white-space: nowrap; min-height: 40px;
    transition: background 0.15s;
  }
  .cr-add-btn:hover { background: #5254cc; }

  /* ── COURSES GRID ── */
  .cr-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .cr-card {
    background: ${C.surface}; border-radius: 14px;
    border: 1px solid ${C.border}; padding: 18px;
  }

  .cr-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 10px;
    gap: 8px; flex-wrap: wrap;
  }

  .cr-code-badge {
    padding: 4px 10px; border-radius: 6px;
    background: #1e1b4b; border: 1px solid #3730a3;
    font-size: 11px; font-weight: 700; color: ${C.accent};
    flex-shrink: 0;
  }

  .cr-card-actions { display: flex; gap: 6px; flex-shrink: 0; }

  .cr-btn-edit {
    padding: 4px 10px; border-radius: 6px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 11px; color: ${C.muted}; cursor: pointer;
    font-family: inherit; min-height: 28px;
    transition: all 0.15s;
  }
  .cr-btn-edit:hover { background: #2e2e2e; color: ${C.text}; }

  .cr-btn-delete {
    padding: 4px 10px; border-radius: 6px;
    border: 1px solid #3d1515; background: transparent;
    font-size: 11px; color: ${C.error}; cursor: pointer;
    font-family: inherit; min-height: 28px;
    transition: all 0.15s;
  }
  .cr-btn-delete:hover { background: #2d1414; }

  .cr-card-footer {
    display: flex; align-items: center;
    justify-content: space-between; margin-top: 14px;
  }

  /* ── MODAL ── */
  .cr-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 60;
  }

  .cr-modal {
    background: ${C.surface}; border-radius: 20px 20px 0 0;
    border: 1px solid ${C.border};
    padding: 24px 20px max(24px, env(safe-area-inset-bottom));
    width: 100%; max-width: 460px;
    max-height: 92vh; overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    animation: slideUp 0.22s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cr-modal-handle {
    width: 36px; height: 4px; border-radius: 2px;
    background: ${C.border}; margin: 0 auto 18px; display: block;
  }

  .cr-field { margin-bottom: 14px; }
  .cr-label { font-size: 12px; color: ${C.muted}; display: block; margin-bottom: 6px; }

  .cr-input {
    width: 100%; padding: 11px 14px;
    background: ${C.bg}; border: 1px solid ${C.border};
    border-radius: 8px; font-size: 14px; color: ${C.text};
    outline: none; font-family: inherit;
    transition: border-color 0.15s;
    -webkit-appearance: none; min-height: 44px;
  }
  .cr-input:focus { border-color: ${C.accent}; }
  .cr-input::placeholder { color: ${C.muted}; }

  .cr-textarea {
    width: 100%; padding: 11px 14px;
    background: ${C.bg}; border: 1px solid ${C.border};
    border-radius: 8px; font-size: 14px; color: ${C.text};
    outline: none; font-family: inherit; resize: vertical;
    min-height: 80px; transition: border-color 0.15s;
  }
  .cr-textarea:focus { border-color: ${C.accent}; }
  .cr-textarea::placeholder { color: ${C.muted}; }

  .cr-error {
    background: #2d1414; border: 1px solid ${C.error};
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: ${C.error}; margin-bottom: 16px;
  }

  .cr-modal-actions { display: flex; gap: 10px; margin-top: 6px; }

  .cr-btn-cancel {
    flex: 1; padding: 12px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 13px; font-weight: 600; color: ${C.muted};
    cursor: pointer; font-family: inherit; min-height: 44px;
    transition: all 0.15s;
  }
  .cr-btn-cancel:hover { background: #2e2e2e; color: ${C.text}; }

  .cr-btn-save {
    flex: 1; padding: 12px; border-radius: 8px;
    border: none; background: ${C.accent};
    font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: inherit; min-height: 44px;
    transition: all 0.15s;
  }
  .cr-btn-save:hover:not(:disabled) { background: #5254cc; }
  .cr-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .cr-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .cr-shell   { flex-direction: column; }
    .cr-sidebar { display: none; }
    .cr-topbar  { display: flex; width: 100%; }

    .cr-main {
      flex: 1; width: 100%; max-width: 100%;
      padding: 20px 16px; min-width: 0; overflow-x: hidden;
    }

    .cr-grid { grid-template-columns: 1fr; }
    .cr-page-header { margin-bottom: 20px; }
  }
  @media (max-width: 400px) {
    .cr-main { padding: 16px 12px; }
    .cr-card { padding: 14px; }
    .cr-add-btn { padding: 10px 14px; font-size: 12px; }
  }

  @media (min-width: 769px) {
    .cr-overlay { align-items: center; }
    .cr-modal { border-radius: 16px; max-height: 88vh; }
    .cr-modal-handle { display: none; }
  }
`;

// Shared sidebar nav content used in both desktop sidebar & mobile drawer
function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  function go(path) {
    navigate(path);
    onNavigate?.();
  }

  return (
    <>
      <div className="cr-sidebar-logo">
        <div className="cr-sidebar-icon-box">H</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</div>
          <div style={{ fontSize: 10, color: C.muted }}>Rep Dashboard</div>
        </div>
      </div>

      <div className="cr-sidebar-nav">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`cr-nav-item ${active ? "active" : "inactive"}`}
              onClick={() => go(item.path)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="cr-sidebar-footer">
        <div className="cr-user-row">
          <div className="cr-avatar">{user.name?.[0]?.toUpperCase() || "R"}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{user.student_id}</div>
          </div>
        </div>
        <button className="cr-logout" onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </>
  );
}

export default function Courses() {
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState({ name: "", code: "", description: "" });
  const [error,     setError]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

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
    <>
      <style>{styles}</style>
      <div className="cr-shell">

        {/* ── Desktop Sidebar ── */}
        <div className="cr-sidebar">
          <SidebarContent />
        </div>

        {/* ── Mobile Top Bar ── */}
        <div className="cr-topbar">
          <div className="cr-topbar-logo">
            <div className="cr-sidebar-icon-box">H</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</span>
          </div>
          <button
            className="cr-hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Menu"
          >
            <span style={drawerOpen ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
            <span style={drawerOpen ? { opacity: 0 } : {}} />
            <span style={drawerOpen ? { transform: "rotate(-45deg) translate(4px, -4px)" } : {}} />
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        <div className={`cr-sidebar-overlay ${drawerOpen ? "open" : ""}`}>
          <div className="cr-sidebar-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="cr-sidebar-drawer">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="cr-main">

          {/* Header */}
          <div className="cr-page-header">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Courses</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Manage your courses</div>
            </div>
            <button className="cr-add-btn" onClick={openAdd}>+ Add Course</button>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
          ) : courses.length === 0 ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No courses yet. Add one!</div>
          ) : (
            <div className="cr-grid">
              {courses.map((c) => (
                <div key={c.id} className="cr-card">
                  <div className="cr-card-top">
                    <span className="cr-code-badge">{c.code}</span>
                    <div className="cr-card-actions">
                      <button className="cr-btn-edit" onClick={() => openEdit(c)}>Edit</button>
                      <button className="cr-btn-delete" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, minHeight: 36 }}>
                    {c.description || "No description"}
                  </div>

                  <div className="cr-card-footer">
                    <div style={{ fontSize: 11, color: C.muted }}>
                      📄 {c.handout_count} handout{c.handout_count !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: c.is_active ? "#4ade80" : C.muted }}>
                      {c.is_active ? "● Active" : "● Inactive"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Modal ── */}
        {showModal && (
          <div className="cr-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="cr-modal">
              <div className="cr-modal-handle" />

              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>
                {editing ? "Edit Course" : "Add Course"}
              </div>

              {error && <div className="cr-error">{error}</div>}

              <div className="cr-field">
                <label className="cr-label">Course Name</label>
                <input
                  className="cr-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Introduction to Chemistry"
                />
              </div>

              <div className="cr-field">
                <label className="cr-label">Course Code</label>
                <input
                  className="cr-input"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. CHM101"
                  autoCapitalize="characters"
                />
              </div>

              <div className="cr-field" style={{ marginBottom: 20 }}>
                <label className="cr-label">Description (optional)</label>
                <textarea
                  className="cr-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>

              <div className="cr-modal-actions">
                <button className="cr-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="cr-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}