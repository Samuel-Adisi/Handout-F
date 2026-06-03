import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

  .ho-shell {
    display: flex; min-height: 100vh;
    background: ${C.bg}; font-family: system-ui, sans-serif;
  }

  /* ── SIDEBAR ── */
  .ho-sidebar {
    width: 220px; min-height: 100vh;
    background: ${C.surface}; border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; flex-shrink: 0;
  }

  .ho-sidebar-logo {
    padding: 20px 16px; border-bottom: 1px solid ${C.border};
    display: flex; align-items: center; gap: 10px;
  }

  .ho-logo-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: ${C.accent}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #fff;
  }

  .ho-sidebar-nav { flex: 1; padding: 12px 10px; }

  .ho-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; margin-bottom: 4px;
    cursor: pointer; font-size: 13px; transition: all 0.15s;
    border: none; width: 100%; font-family: inherit; text-align: left;
  }
  .ho-nav-item:hover { background: #2e2e2e; }
  .ho-nav-item.active { background: ${C.accent}; color: #fff; font-weight: 600; }
  .ho-nav-item.inactive { background: transparent; color: ${C.muted}; font-weight: 400; }

  .ho-sidebar-footer { padding: 12px 10px; border-top: 1px solid ${C.border}; }

  .ho-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; margin-bottom: 4px;
  }

  .ho-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: ${C.accent}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
  }

  .ho-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; min-height: 44px;
    cursor: pointer; color: #ef4444; font-size: 13px;
    border: none; background: transparent;
    font-family: inherit; width: 100%; text-align: left;
  }
  .ho-logout:hover { background: #2d1414; }

  /* ── MOBILE TOPBAR ── */
  .ho-topbar {
    display: none;
    position: sticky; top: 0; z-index: 40;
    background: ${C.surface}ee; backdrop-filter: blur(12px);
    border-bottom: 1px solid ${C.border};
    padding: 0 16px; height: 56px;
    align-items: center; justify-content: space-between;
  }

  .ho-topbar-logo { display: flex; align-items: center; gap: 10px; }

  .ho-hamburger {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    cursor: pointer; gap: 5px; flex-shrink: 0;
  }
  .ho-hamburger span {
    display: block; width: 16px; height: 1.5px;
    background: ${C.muted}; border-radius: 2px; transition: all 0.2s;
  }

  /* ── MOBILE DRAWER ── */
  .ho-drawer-overlay {
    display: none; position: fixed; inset: 0; z-index: 50;
  }
  .ho-drawer-overlay.open { display: block; }

  .ho-drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }

  .ho-drawer {
    position: absolute; top: 0; left: 0; bottom: 0; width: 240px;
    background: ${C.surface}; border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    transform: translateX(-100%); transition: transform 0.25s ease;
  }
  .ho-drawer-overlay.open .ho-drawer { transform: translateX(0); }

  /* ── MAIN ── */
  .ho-main { flex: 1; overflow-y: auto; padding: 28px 24px; min-width: 0; }

  /* ── HEADER ROW ── */
  .ho-page-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  }

  .ho-add-btn {
    padding: 10px 18px; background: ${C.accent};
    color: #fff; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; white-space: nowrap; min-height: 40px;
    transition: background 0.15s; flex-shrink: 0;
  }
  .ho-add-btn:hover { background: #5254cc; }

  /* ── BULK BAR ── */
  .ho-bulk-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: #1e1b2e; border: 1px solid #3730a3;
    border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
    gap: 12px; animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .ho-bulk-label { font-size: 13px; font-weight: 600; color: ${C.accent}; }

  .ho-btn-bulk-delete {
    padding: 8px 16px; border-radius: 7px;
    border: 1px solid #3d1515; background: transparent;
    font-size: 12px; font-weight: 600; color: ${C.error};
    cursor: pointer; font-family: inherit; min-height: 34px;
    transition: all 0.15s; white-space: nowrap;
  }
  .ho-btn-bulk-delete:hover { background: #2d1414; }
  .ho-btn-bulk-cancel {
    padding: 8px 16px; border-radius: 7px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 12px; font-weight: 600; color: ${C.muted};
    cursor: pointer; font-family: inherit; min-height: 34px;
    transition: all 0.15s;
  }
  .ho-btn-bulk-cancel:hover { background: #2e2e2e; color: ${C.text}; }

  /* ── CHECKBOX ── */
  .ho-cb {
    width: 16px; height: 16px; accent-color: ${C.accent};
    cursor: pointer; flex-shrink: 0;
  }

  /* ── FILTERS ── */
  .ho-filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }

  .ho-input {
    padding: 10px 14px; background: ${C.bg};
    border: 1px solid ${C.border}; border-radius: 8px;
    font-size: 13px; color: ${C.text}; outline: none;
    font-family: inherit; transition: border-color 0.15s;
    appearance: none; -webkit-appearance: none; min-height: 42px;
  }
  .ho-input::placeholder { color: ${C.muted}; }
  .ho-input:focus { border-color: ${C.accent}; }

  /* ── DESKTOP TABLE ── */
  .ho-table-card {
    background: ${C.surface}; border-radius: 14px;
    border: 1px solid ${C.border}; overflow: hidden;
  }

  .ho-table { width: 100%; border-collapse: collapse; }
  .ho-table th {
    padding: 12px 20px; text-align: left;
    font-size: 11px; font-weight: 600; color: ${C.muted};
    background: #141414;
  }
  .ho-table td { padding: 14px 20px; border-top: 1px solid ${C.border}; }
  .ho-table tr.selected-row { background: #1a1830; }

  .ho-course-badge {
    padding: 3px 10px; border-radius: 6px;
    background: #1e1b4b; border: 1px solid #3730a3;
    font-size: 11px; font-weight: 700; color: ${C.accent};
    display: inline-block;
  }

  .ho-status-badge {
    padding: 3px 10px; border-radius: 6px;
    font-size: 11px; font-weight: 600; display: inline-block;
  }

  .ho-action-btn {
    padding: 4px 12px; border-radius: 6px;
    font-size: 11px; cursor: pointer; font-family: inherit; min-height: 28px;
    transition: all 0.15s;
  }
  .ho-btn-edit {
    border: 1px solid ${C.border}; background: transparent; color: ${C.muted};
  }
  .ho-btn-edit:hover { background: #2e2e2e; color: ${C.text}; }
  .ho-btn-delete {
    border: 1px solid #3d1515; background: transparent; color: ${C.error};
  }
  .ho-btn-delete:hover { background: #2d1414; }

  /* ── MOBILE CARD LIST ── */
  .ho-card-list { display: none; }

  .ho-hcard {
    background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 14px; padding: 16px; margin-bottom: 10px;
    transition: border-color 0.15s;
  }
  .ho-hcard.selected { border-color: ${C.accent}; background: #1a1830; }

  .ho-hcard-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 10px; gap: 8px;
  }

  .ho-hcard-meta {
    display: flex; align-items: center; gap: 8px;
    flex-wrap: wrap; margin-bottom: 6px;
  }

  .ho-hcard-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; margin-top: 10px;
    border-top: 1px solid ${C.border};
  }

  .ho-hcard-actions { display: flex; gap: 8px; }

  /* ── MODAL ── */
  .ho-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: flex-end; justify-content: center; z-index: 60;
  }

  .ho-modal {
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

  .ho-modal-handle {
    width: 36px; height: 4px; border-radius: 2px;
    background: ${C.border}; margin: 0 auto 18px; display: block;
  }

  .ho-field { margin-bottom: 14px; }
  .ho-label { font-size: 12px; color: ${C.muted}; display: block; margin-bottom: 6px; }

  .ho-field-input {
    width: 100%; padding: 11px 14px;
    background: ${C.bg}; border: 1px solid ${C.border};
    border-radius: 8px; font-size: 14px; color: ${C.text};
    outline: none; font-family: inherit; transition: border-color 0.15s;
    -webkit-appearance: none; min-height: 44px;
  }
  .ho-field-input:focus { border-color: ${C.accent}; }
  .ho-field-input::placeholder { color: ${C.muted}; }

  .ho-textarea {
    width: 100%; padding: 11px 14px;
    background: ${C.bg}; border: 1px solid ${C.border};
    border-radius: 8px; font-size: 14px; color: ${C.text};
    outline: none; font-family: inherit; resize: vertical; min-height: 70px;
    transition: border-color 0.15s;
  }
  .ho-textarea:focus { border-color: ${C.accent}; }
  .ho-textarea::placeholder { color: ${C.muted}; }

  .ho-price-stock-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;
  }

  .ho-error {
    background: #2d1414; border: 1px solid ${C.error};
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: ${C.error}; margin-bottom: 16px; line-height: 1.5;
  }

  .ho-modal-actions { display: flex; gap: 10px; }

  .ho-btn-cancel {
    flex: 1; padding: 12px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 13px; font-weight: 600; color: ${C.muted};
    cursor: pointer; font-family: inherit; min-height: 44px;
    transition: all 0.15s;
  }
  .ho-btn-cancel:hover { background: #2e2e2e; color: ${C.text}; }

  .ho-btn-save {
    flex: 1; padding: 12px; border-radius: 8px;
    border: none; background: ${C.accent};
    font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: inherit; min-height: 44px;
    transition: all 0.15s;
  }
  .ho-btn-save:hover:not(:disabled) { background: #5254cc; }
  .ho-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .ho-sidebar { display: none; }
    .ho-topbar { display: flex; }
    .ho-main { padding: 20px 16px; }

    .ho-filters { flex-direction: column; gap: 8px; }
    .ho-input { width: 100% !important; font-size: 16px; }

    .ho-table-card { display: none; }
    .ho-card-list { display: block; }
  }

  @media (max-width: 400px) {
    .ho-main { padding: 16px 12px; }
    .ho-hcard { padding: 12px; }
    .ho-add-btn { font-size: 12px; padding: 10px 12px; }
  }

  @media (min-width: 769px) {
    .ho-drawer-overlay { display: none !important; }
    .ho-overlay { align-items: center; }
    .ho-modal { border-radius: 16px; max-height: 88vh; }
    .ho-modal-handle { display: none; }
  }
`;

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() { localStorage.clear(); navigate("/login"); }
  function go(path) { navigate(path); onNavigate?.(); }

  return (
    <>
      <div className="ho-sidebar-logo">
        <div className="ho-logo-box">H</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</div>
          <div style={{ fontSize: 10, color: C.muted }}>Rep Dashboard</div>
        </div>
      </div>
      <div className="ho-sidebar-nav">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`ho-nav-item ${active ? "active" : "inactive"}`}
              onClick={() => go(item.path)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="ho-sidebar-footer">
        <div className="ho-user-row">
          <div className="ho-avatar">{user.name?.[0]?.toUpperCase() || "R"}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{user.student_id}</div>
          </div>
        </div>
        <button className="ho-logout" onClick={logout}><span>🚪</span> Logout</button>
      </div>
    </>
  );
}

function stockColor(stock) {
  if (stock > 10) return "#4ade80";
  if (stock > 0)  return "#fbbf24";
  return "#f87171";
}

export default function Handouts() {
  const queryClient = useQueryClient();

  const { data: handouts = [], isLoading: loadingHandouts } = useQuery({
    queryKey: ["rep-handouts"],
    queryFn: () => api.get("/handouts/").then(r => r.data),
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["rep-courses"],
    queryFn: () => api.get("/courses/").then(r => r.data),
  });

  const loading = loadingHandouts || loadingCourses;

  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState({ title: "", description: "", course_id: "", price: "", stock: "" });
  const [error,        setError]        = useState("");
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [selected,     setSelected]     = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Selection helpers ──
  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((h) => h.id)));
    }
  }

  function clearSelection() { setSelected(new Set()); }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} handout${selected.size > 1 ? "s" : ""}?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selected].map((id) => api.delete(`/handouts/${id}/`)));
      queryClient.setQueryData(["rep-handouts"], (prev) => prev.filter((h) => !selected.has(h.id)));
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkDeleting(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: "", description: "", course_id: "", price: "", stock: "" });
    setError("");
    setShowModal(true);
  }

  function openEdit(h) {
    setEditing(h);
    setForm({ title: h.title, description: h.description, course_id: h.course?.id, price: h.price, stock: h.stock });
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
      queryClient.invalidateQueries({ queryKey: ["rep-handouts"] });
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
      queryClient.setQueryData(["rep-handouts"], (prev) => prev.filter((h) => h.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = handouts.filter((h) => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse ? h.course?.id === parseInt(filterCourse) : true;
    return matchSearch && matchCourse;
  });

  const allSelected  = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  const ModalForm = (
    <div className="ho-modal">
      <div className="ho-modal-handle" />
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>
        {editing ? "Edit Handout" : "Add Handout"}
      </div>

      {error && <div className="ho-error">{error}</div>}

      <div className="ho-field">
        <label className="ho-label">Title</label>
        <input className="ho-field-input" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. CHM101 Week 1 Notes" />
      </div>

      <div className="ho-field">
        <label className="ho-label">Course</label>
        <select className="ho-field-input" value={form.course_id}
          onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
          ))}
        </select>
      </div>

      <div className="ho-field">
        <label className="ho-label">Description</label>
        <textarea className="ho-textarea" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description..." />
      </div>

      <div className="ho-price-stock-grid">
        <div>
          <label className="ho-label">Price (GHS)</label>
          <input className="ho-field-input" type="number" inputMode="decimal"
            value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="5.00" />
        </div>
        <div>
          <label className="ho-label">Stock</label>
          <input className="ho-field-input" type="number" inputMode="numeric"
            value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="50" />
        </div>
      </div>

      <div className="ho-modal-actions">
        <button className="ho-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
        <button className="ho-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="ho-shell">

        {/* Desktop Sidebar */}
        <div className="ho-sidebar">
          <SidebarContent />
        </div>

        {/* Mobile Topbar */}
        <div className="ho-topbar">
          <div className="ho-topbar-logo">
            <div className="ho-logo-box">H</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</span>
          </div>
          <button className="ho-hamburger" onClick={() => setDrawerOpen(o => !o)} aria-label="Menu">
            <span style={drawerOpen ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
            <span style={drawerOpen ? { opacity: 0 } : {}} />
            <span style={drawerOpen ? { transform: "rotate(-45deg) translate(4px, -4px)" } : {}} />
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`ho-drawer-overlay ${drawerOpen ? "open" : ""}`}>
          <div className="ho-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="ho-drawer">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        {/* Main */}
        <div className="ho-main">

          {/* Header */}
          <div className="ho-page-header">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Handouts</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Manage your handouts</div>
            </div>
            <button className="ho-add-btn" onClick={openAdd}>+ Add Handout</button>
          </div>

          {/* Filters */}
          <div className="ho-filters">
            <input
              className="ho-input"
              style={{ width: 240 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handouts..."
            />
            <select
              className="ho-input"
              style={{ width: 200 }}
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          {/* Bulk Action Bar */}
          {someSelected && (
            <div className="ho-bulk-bar">
              <span className="ho-bulk-label">
                {selected.size} handout{selected.size > 1 ? "s" : ""} selected
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ho-btn-bulk-cancel" onClick={clearSelection}>Cancel</button>
                <button className="ho-btn-bulk-delete" onClick={handleBulkDelete} disabled={bulkDeleting}>
                  {bulkDeleting ? "Deleting..." : `Delete ${selected.size}`}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No handouts found.</div>
          ) : (
            <>
              {/* ── Desktop Table ── */}
              <div className="ho-table-card">
                <table className="ho-table">
                  <thead>
                    <tr style={{ background: "#141414" }}>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="ho-cb"
                          checked={allSelected}
                          onChange={toggleAll}
                        />
                      </th>
                      {["Title", "Course", "Price", "Stock", "Status", "Actions"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h) => (
                      <tr key={h.id} className={selected.has(h.id) ? "selected-row" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            className="ho-cb"
                            checked={selected.has(h.id)}
                            onChange={() => toggleOne(h.id)}
                          />
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{h.title}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{h.description?.slice(0, 50)}</div>
                        </td>
                        <td><span className="ho-course-badge">{h.course?.code}</span></td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: C.text }}>GHS {h.price}</td>
                        <td>
                          <span style={{ fontSize: 13, fontWeight: 600, color: stockColor(h.stock) }}>{h.stock}</span>
                        </td>
                        <td>
                          <span className="ho-status-badge" style={{
                            color: h.is_active ? "#4ade80" : C.muted,
                            background: h.is_active ? "#052e16" : "#1a1a1a",
                          }}>
                            {h.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="ho-action-btn ho-btn-edit" onClick={() => openEdit(h)}>Edit</button>
                            <button className="ho-action-btn ho-btn-delete" onClick={() => handleDelete(h.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Card List ── */}
              <div className="ho-card-list">

                {/* Mobile Select All row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    className="ho-cb"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {allSelected ? "Deselect all" : "Select all"}
                  </span>
                </div>

                {filtered.map((h) => (
                  <div key={h.id} className={`ho-hcard ${selected.has(h.id) ? "selected" : ""}`}>
                    <div className="ho-hcard-top">
                      <input
                        type="checkbox"
                        className="ho-cb"
                        checked={selected.has(h.id)}
                        onChange={() => toggleOne(h.id)}
                        style={{ marginTop: 2 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>
                          {h.title}
                        </div>
                        <div className="ho-hcard-meta">
                          <span className="ho-course-badge">{h.course?.code}</span>
                          <span className="ho-status-badge" style={{
                            color: h.is_active ? "#4ade80" : C.muted,
                            background: h.is_active ? "#052e16" : "#1e1e1e",
                          }}>
                            {h.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {h.description && (
                          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                            {h.description.slice(0, 70)}{h.description.length > 70 ? "…" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ho-hcard-footer">
                      <div style={{ display: "flex", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>PRICE</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>GHS {h.price}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>STOCK</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: stockColor(h.stock) }}>{h.stock}</div>
                        </div>
                      </div>
                      <div className="ho-hcard-actions">
                        <button className="ho-action-btn ho-btn-edit" onClick={() => openEdit(h)}>Edit</button>
                        <button className="ho-action-btn ho-btn-delete" onClick={() => handleDelete(h.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="ho-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            {ModalForm}
          </div>
        )}
      </div>
    </>
  );
}