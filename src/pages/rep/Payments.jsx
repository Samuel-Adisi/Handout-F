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

const STATUS_COLOR = {
  successful: { color: "#4ade80", bg: "#052e16" },
  pending:    { color: "#fbbf24", bg: "#2d1f00" },
  failed:     { color: "#f87171", bg: "#2d0f0f" },
  expired:    { color: "#9CA3AF", bg: "#1a1a1a" },
};
const statusColor = (s) => STATUS_COLOR[s] ?? { color: "#9CA3AF", bg: "#1a1a1a" };

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f0f; }

  .pm-shell {
    display: flex; min-height: 100vh;
    background: #0f0f0f; font-family: system-ui, sans-serif;
  }

  /* ── SIDEBAR ── */
  .pm-sidebar {
    width: 220px; min-height: 100vh;
    background: #1a1a1a; border-right: 1px solid #2e2e2e;
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; flex-shrink: 0;
  }
  .pm-sidebar-logo {
    padding: 20px 16px; border-bottom: 1px solid #2e2e2e;
    display: flex; align-items: center; gap: 10px;
  }
  .pm-logo-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: #6366f1; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #fff;
  }
  .pm-sidebar-nav { flex: 1; padding: 12px 10px; }
  .pm-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; margin-bottom: 4px;
    cursor: pointer; font-size: 13px; transition: all 0.15s;
    border: none; width: 100%; font-family: inherit; text-align: left;
  }
  .pm-nav-item:hover { background: #2e2e2e; }
  .pm-nav-item.active { background: #6366f1; color: #fff; font-weight: 600; }
  .pm-nav-item.inactive { background: transparent; color: #9CA3AF; font-weight: 400; }
  .pm-sidebar-footer { padding: 12px 10px; border-top: 1px solid #2e2e2e; }
  .pm-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; margin-bottom: 4px;
  }
  .pm-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #6366f1; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
  }
  .pm-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; min-height: 44px;
    cursor: pointer; color: #ef4444; font-size: 13px;
    border: none; background: transparent;
    font-family: inherit; width: 100%; text-align: left;
  }
  .pm-logout:hover { background: #2d1414; }

  /* ── MOBILE TOPBAR ── */
  .pm-topbar {
    display: none;
    position: sticky; top: 0; z-index: 40;
    background: #1a1a1aee; backdrop-filter: blur(12px);
    border-bottom: 1px solid #2e2e2e;
    padding: 0 16px; height: 56px;
    align-items: center; justify-content: space-between;
  }
  .pm-topbar-logo { display: flex; align-items: center; gap: 10px; }
  .pm-hamburger {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid #2e2e2e; background: transparent;
    cursor: pointer; gap: 5px; flex-shrink: 0;
  }
  .pm-hamburger span {
    display: block; width: 16px; height: 1.5px;
    background: #9CA3AF; border-radius: 2px; transition: all 0.2s;
  }

  /* ── MOBILE DRAWER ── */
  .pm-drawer-overlay {
    display: none; position: fixed; inset: 0; z-index: 50;
  }
  .pm-drawer-overlay.open { display: block; }
  .pm-drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
  .pm-drawer {
    position: absolute; top: 0; left: 0; bottom: 0; width: 240px;
    background: #1a1a1a; border-right: 1px solid #2e2e2e;
    display: flex; flex-direction: column;
    transform: translateX(-100%); transition: transform 0.25s ease;
  }
  .pm-drawer-overlay.open .pm-drawer { transform: translateX(0); }

  /* ── MAIN ── */
  .pm-main { flex: 1; overflow-y: auto; padding: 28px 24px; min-width: 0; }

  /* ── STATS GRID ── */
  .pm-stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 24px;
  }
  @media (max-width: 900px) { .pm-stats-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .pm-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

  .pm-stat-card {
    background: #1a1a1a; border-radius: 14px;
    border: 1px solid #2e2e2e; padding: 18px;
  }

  /* ── FILTERS ── */
  .pm-filters {
    display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .pm-filter-search { flex: 1; min-width: 160px; }
  .pm-filter-select { width: 160px; }
  @media (max-width: 480px) { .pm-filter-select { width: 100%; } }

  .pm-input {
    padding: 10px 14px; background: #0f0f0f;
    border: 1px solid #2e2e2e; border-radius: 8px;
    font-size: 13px; color: #ffffff; outline: none;
    font-family: inherit; width: 100%; transition: border-color 0.15s;
    appearance: none; -webkit-appearance: none; min-height: 42px;
  }
  .pm-input::placeholder { color: #9CA3AF; }
  .pm-input:focus { border-color: #6366f1; }

  /* ── BULK BAR ── */
  .pm-bulk-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: #1e1b2e; border: 1px solid #3730a3;
    border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
    gap: 12px; animation: pmFadeIn 0.15s ease;
  }
  @keyframes pmFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pm-bulk-label { font-size: 13px; font-weight: 600; color: #6366f1; }
  .pm-btn-bulk-delete {
    padding: 8px 16px; border-radius: 7px;
    border: 1px solid #3d1515; background: transparent;
    font-size: 12px; font-weight: 600; color: #ef4444;
    cursor: pointer; font-family: inherit; min-height: 34px;
    transition: all 0.15s; white-space: nowrap;
  }
  .pm-btn-bulk-delete:hover { background: #2d1414; }
  .pm-btn-bulk-delete:disabled { opacity: 0.6; cursor: not-allowed; }
  .pm-btn-bulk-cancel {
    padding: 8px 16px; border-radius: 7px;
    border: 1px solid #2e2e2e; background: transparent;
    font-size: 12px; font-weight: 600; color: #9CA3AF;
    cursor: pointer; font-family: inherit; min-height: 34px;
    transition: all 0.15s;
  }
  .pm-btn-bulk-cancel:hover { background: #2e2e2e; color: #fff; }

  /* ── CHECKBOX ── */
  .pm-cb {
    width: 16px; height: 16px; accent-color: #6366f1;
    cursor: pointer; flex-shrink: 0;
  }

  /* ── TABLE ── */
  .pm-table-card {
    background: #1a1a1a; border-radius: 14px;
    border: 1px solid #2e2e2e; overflow: hidden;
  }
  .pm-table { width: 100%; border-collapse: collapse; }
  .pm-table th {
    padding: 12px 20px; text-align: left;
    font-size: 11px; font-weight: 600; color: #9CA3AF;
    background: #141414; white-space: nowrap;
  }
  .pm-table td { padding: 14px 20px; border-top: 1px solid #2e2e2e; }
  .pm-table tr.pm-selected-row { background: #1a1830; }

  /* ── MOBILE CARDS ── */
  .pm-cards { display: none; flex-direction: column; gap: 10px; }

  .pm-pcard {
    background: #1a1a1a; border: 1px solid #2e2e2e;
    border-radius: 14px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 10px;
    transition: border-color 0.15s;
  }
  .pm-pcard.selected { border-color: #6366f1; background: #1a1830; }

  /* ── RESPONSIVE ── */
 @media (max-width: 768px) {
  .pm-shell   { flex-direction: column; }          /* ← THE FIX */

  .pm-sidebar { display: none; }
  .pm-topbar  { display: flex; width: 100%; }

  .pm-main {
    flex: 1; width: 100%; max-width: 100%;
    padding: 20px 16px; min-width: 0; overflow-x: hidden;
  }

  .pm-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .pm-stat-card { min-width: 0; }

  .pm-filters { flex-direction: column; gap: 8px; }
  .pm-filter-select { width: 100%; }
  .pm-input   { font-size: 16px; }

  .pm-table-card { display: none; }
  .pm-cards   { display: flex; }
}
 @media (max-width: 400px) {
  .pm-main  { padding: 16px 10px; }
  .pm-pcard { padding: 12px; }
  .pm-stats-grid { gap: 6px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
  @media (min-width: 769px) {
    .pm-drawer-overlay { display: none !important; }
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
      <div className="pm-sidebar-logo">
        <div className="pm-logo-box">H</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</div>
          <div style={{ fontSize: 10, color: C.muted }}>Rep Dashboard</div>
        </div>
      </div>
      <div className="pm-sidebar-nav">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`pm-nav-item ${active ? "active" : "inactive"}`}
              onClick={() => go(item.path)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pm-sidebar-footer">
        <div className="pm-user-row">
          <div className="pm-avatar">{user.name?.[0]?.toUpperCase() || "R"}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{user.student_id}</div>
          </div>
        </div>
        <button className="pm-logout" onClick={logout}><span>🚪</span> Logout</button>
      </div>
    </>
  );
}

export default function Payments() {
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("");
  const [stats,        setStats]        = useState({ total: 0, successful: 0, pending: 0, revenue: 0 });
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [selected,     setSelected]     = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/payments/my/");
      setPayments(data);
      const successful = data.filter((p) => p.status === "successful");
      const pending    = data.filter((p) => p.status === "pending");
      const revenue    = successful.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      setStats({ total: data.length, successful: successful.length, pending: pending.length, revenue: revenue.toFixed(2) });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.student?.name?.toLowerCase().includes(q) ||
      p.student?.student_id?.toLowerCase().includes(q) ||
      p.handout?.title?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q);
    return matchSearch && (filter ? p.status === filter : true);
  });

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
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  }

  function clearSelection() { setSelected(new Set()); }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} payment${selected.size > 1 ? "s" : ""}?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selected].map((id) => api.delete(`/payments/${id}/`)));
      setPayments((prev) => prev.filter((p) => !selected.has(p.id)));
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkDeleting(false);
    }
  }

  const allSelected  = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  const STATS = [
    { label: "Total Payments", value: stats.total,      color: "#6366f1" },
    { label: "Successful",     value: stats.successful, color: "#4ade80" },
    { label: "Pending",        value: stats.pending,    color: "#fbbf24" },
    { label: "Revenue (GHS)",  value: stats.revenue,    color: "#06b6d4" },
  ];

  function PaymentCard({ p }) {
    const sc = statusColor(p.status);
    return (
      <div className={`pm-pcard ${selected.has(p.id) ? "selected" : ""}`}>
        {/* Top: checkbox + student + amount */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <input
            type="checkbox"
            className="pm-cb"
            checked={selected.has(p.id)}
            onChange={() => toggleOne(p.id)}
            style={{ marginTop: 2 }}
          />
          <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.student?.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.student?.student_id}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>GHS {p.amount}</div>
          </div>
        </div>
        {/* Handout */}
        <div style={{ background: "#141414", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{p.handout?.title}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.handout?.course?.code}</div>
        </div>
        {/* MoMo + Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 12, color: C.muted }}>{p.momo_number}</div>
          <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg }}>
            {p.status}
          </span>
        </div>
        {/* Reference + Date */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", wordBreak: "break-all" }}>{p.reference}</span>
          <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{new Date(p.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pm-shell">

        {/* Desktop Sidebar */}
        <div className="pm-sidebar">
          <SidebarContent />
        </div>

        {/* Mobile Topbar */}
        <div className="pm-topbar">
          <div className="pm-topbar-logo">
            <div className="pm-logo-box">H</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</span>
          </div>
          <button className="pm-hamburger" onClick={() => setDrawerOpen(o => !o)} aria-label="Menu">
            <span style={drawerOpen ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
            <span style={drawerOpen ? { opacity: 0 } : {}} />
            <span style={drawerOpen ? { transform: "rotate(-45deg) translate(4px, -4px)" } : {}} />
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`pm-drawer-overlay ${drawerOpen ? "open" : ""}`}>
          <div className="pm-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="pm-drawer">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        {/* Main */}
        <div className="pm-main">

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Payments</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Track all payments for your handouts</div>
          </div>

          {/* Stats */}
          <div className="pm-stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="pm-stat-card">
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>
                  {loading ? "—" : s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="pm-filters">
            <div className="pm-filter-search">
              <input
                className="pm-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, handout, reference..."
              />
            </div>
            <div className="pm-filter-select">
              <select className="pm-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Bulk Bar */}
          {someSelected && (
            <div className="pm-bulk-bar">
              <span className="pm-bulk-label">
                {selected.size} payment{selected.size > 1 ? "s" : ""} selected
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="pm-btn-bulk-cancel" onClick={clearSelection}>Cancel</button>
                <button className="pm-btn-bulk-delete" onClick={handleBulkDelete} disabled={bulkDeleting}>
                  {bulkDeleting ? "Deleting..." : `Delete ${selected.size}`}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No payments found.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="pm-table-card">
                <table className="pm-table">
                  <thead>
                    <tr style={{ background: "#141414" }}>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="pm-cb"
                          checked={allSelected}
                          onChange={toggleAll}
                        />
                      </th>
                      {["Student", "Handout", "MoMo Number", "Amount", "Reference", "Status", "Date"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const sc = statusColor(p.status);
                      return (
                        <tr key={p.id} className={selected.has(p.id) ? "pm-selected-row" : ""}>
                          <td>
                            <input
                              type="checkbox"
                              className="pm-cb"
                              checked={selected.has(p.id)}
                              onChange={() => toggleOne(p.id)}
                            />
                          </td>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.student?.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{p.student?.student_id}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 13, color: C.text }}>{p.handout?.title}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{p.handout?.course?.code}</div>
                          </td>
                          <td style={{ fontSize: 13, color: C.muted }}>{p.momo_number}</td>
                          <td style={{ fontSize: 13, fontWeight: 600, color: C.text }}>GHS {p.amount}</td>
                          <td>
                            <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{p.reference}</span>
                          </td>
                          <td>
                            <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="pm-cards">
                {/* Select All row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    className="pm-cb"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {allSelected ? "Deselect all" : "Select all"}
                  </span>
                </div>
                {filtered.map((p) => <PaymentCard key={p.id} p={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}