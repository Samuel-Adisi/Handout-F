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
  green:   "#16A34A",
  greenLight: "#052e16",
  greenText:  "#4ade80",
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

  .db-shell {
    display: flex; min-height: 100vh;
    background: ${C.bg}; font-family: system-ui, sans-serif;
  }

  /* ── SIDEBAR ── */
  .db-sidebar {
    width: 220px; min-height: 100vh;
    background: ${C.surface}; border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; flex-shrink: 0;
  }

  .db-sidebar-logo {
    padding: 20px 16px; border-bottom: 1px solid ${C.border};
    display: flex; align-items: center; gap: 10px;
  }

  .db-logo-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: ${C.accent}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #fff;
  }

  .db-sidebar-nav { flex: 1; padding: 12px 10px; }

  .db-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; margin-bottom: 4px;
    cursor: pointer; font-size: 13px; transition: all 0.15s;
    border: none; width: 100%; font-family: inherit; text-align: left;
  }
  .db-nav-item:hover { background: #2e2e2e; }
  .db-nav-item.active { background: ${C.accent}; color: #fff; font-weight: 600; }
  .db-nav-item.inactive { background: transparent; color: ${C.muted}; font-weight: 400; }

  .db-sidebar-footer { padding: 12px 10px; border-top: 1px solid ${C.border}; }

  .db-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; margin-bottom: 4px;
  }

  .db-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: ${C.accent}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
  }

  .db-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    cursor: pointer; color: #ef4444; font-size: 13px;
    border: none; background: transparent;
    font-family: inherit; width: 100%; text-align: left;
    min-height: 44px;
  }
  .db-logout:hover { background: #2d1414; }

  /* ── MOBILE TOPBAR ── */
  .db-topbar {
    display: none;
    position: sticky; top: 0; z-index: 40;
    background: ${C.surface}ee; backdrop-filter: blur(12px);
    border-bottom: 1px solid ${C.border};
    padding: 0 16px; height: 56px;
    align-items: center; justify-content: space-between;
  }

  .db-topbar-logo { display: flex; align-items: center; gap: 10px; }

  .db-hamburger {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    cursor: pointer; gap: 5px; flex-shrink: 0;
  }
  .db-hamburger span {
    display: block; width: 16px; height: 1.5px;
    background: ${C.muted}; border-radius: 2px; transition: all 0.2s;
  }

  /* ── MOBILE DRAWER ── */
  .db-drawer-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 50;
  }
  .db-drawer-overlay.open { display: block; }

  .db-drawer-backdrop {
    position: absolute; inset: 0; background: rgba(0,0,0,0.6);
  }

  .db-drawer {
    position: absolute; top: 0; left: 0; bottom: 0;
    width: 240px; background: ${C.surface};
    border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  .db-drawer-overlay.open .db-drawer { transform: translateX(0); }

  /* ── MAIN ── */
  .db-main { flex: 1; overflow-y: auto; padding: 28px 24px; min-width: 0; }

  /* ── KPI GRID ── */
  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 24px;
  }

  .db-kpi-card {
    background: ${C.surface}; border-radius: 14px;
    border: 1px solid ${C.border}; padding: 18px;
  }

  .db-kpi-top {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 12px;
  }

  /* ── PAYMENTS TABLE CARD ── */
  .db-table-card {
    background: ${C.surface}; border-radius: 14px;
    border: 1px solid ${C.border}; overflow: hidden;
  }

  .db-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid ${C.border};
  }

  .db-view-all {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 12px; color: ${C.muted}; cursor: pointer;
    font-family: inherit; min-height: 32px;
    transition: all 0.15s;
  }
  .db-view-all:hover { background: #2e2e2e; color: ${C.text}; }

  /* desktop table */
  .db-table {
    width: 100%; border-collapse: collapse;
  }
  .db-table th {
    padding: 10px 20px; text-align: left;
    font-size: 11px; font-weight: 600; color: ${C.muted};
    background: #141414;
  }
  .db-table td { padding: 14px 20px; border-top: 1px solid ${C.border}; }

  /* mobile payment rows (replaces table on small screens) */
  .db-pay-list { display: none; }
  .db-pay-row {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; border-top: 1px solid ${C.border};
  }
  .db-pay-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: #1e1b4b; border: 1px solid #3730a3;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .db-pay-info { flex: 1; min-width: 0; }
  .db-pay-name { font-size: 13px; font-weight: 600; color: ${C.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .db-pay-sub { font-size: 11px; color: ${C.muted}; margin-top: 2px; }
  .db-pay-right { text-align: right; flex-shrink: 0; }
  .db-pay-amount { font-size: 13px; font-weight: 700; color: ${C.text}; margin-bottom: 4px; }

  .db-badge {
    display: inline-block;
    padding: 3px 10px; border-radius: 6px;
    font-size: 11px; font-weight: 600; text-transform: capitalize;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .db-sidebar { display: none; }
    .db-topbar { display: flex; }
    .db-main { padding: 20px 16px; }

    .db-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
    .db-kpi-card { padding: 14px; }

    /* hide table, show card list */
    .db-table { display: none; }
    .db-pay-list { display: block; }
    .db-table-header { padding: 14px 16px; }
  }

  @media (max-width: 400px) {
    .db-main { padding: 16px 12px; }
    .db-kpi-grid { gap: 8px; }
    .db-kpi-card { padding: 12px; }
  }

  @media (min-width: 769px) {
    .db-drawer-overlay { display: none !important; }
  }
`;

function statusColor(s) {
  if (s === "successful") return { color: "#4ade80", bg: "#052e16" };
  if (s === "pending")    return { color: "#fbbf24", bg: "#2d1f00" };
  return                         { color: "#f87171", bg: "#2d0f0f" };
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() { localStorage.clear(); navigate("/login"); }
  function go(path) { navigate(path); onNavigate?.(); }

  return (
    <>
      <div className="db-sidebar-logo">
        <div className="db-logo-box">H</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</div>
          <div style={{ fontSize: 10, color: C.muted }}>Rep Dashboard</div>
        </div>
      </div>
      <div className="db-sidebar-nav">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`db-nav-item ${active ? "active" : "inactive"}`}
              onClick={() => go(item.path)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="db-sidebar-footer">
        <div className="db-user-row">
          <div className="db-avatar">{user.name?.[0]?.toUpperCase() || "R"}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{user.student_id}</div>
          </div>
        </div>
        <button className="db-logout" onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [stats,    setStats]    = useState({ courses: 0, handouts: 0, payments: 0, revenue: 0 });
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, paymentsRes] = await Promise.all([
          api.get("/courses/"),
          api.get("/payments/rep/"),
        ]);
        const courses  = coursesRes.data;
        const pList    = paymentsRes.data;
        const successful = pList.filter((p) => p.status === "successful");
        const revenue    = successful.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        setStats({
          courses:  courses.length,
          handouts: courses.reduce((sum, c) => sum + (c.handout_count || 0), 0),
          payments: successful.length,
          revenue:  revenue.toFixed(2),
        });
        setPayments(pList.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STATS = [
    { label: "Total Courses",  value: stats.courses,  icon: "📚" },
    { label: "Total Handouts", value: stats.handouts, icon: "📄" },
    { label: "Payments",       value: stats.payments, icon: "💳" },
    { label: "Revenue (GHS)",  value: stats.revenue,  icon: "💰" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="db-shell">

        {/* Desktop Sidebar */}
        <div className="db-sidebar">
          <SidebarContent />
        </div>

        {/* Mobile Topbar */}
        <div className="db-topbar">
          <div className="db-topbar-logo">
            <div className="db-logo-box">H</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</span>
          </div>
          <button
            className="db-hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Menu"
          >
            <span style={drawerOpen ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
            <span style={drawerOpen ? { opacity: 0 } : {}} />
            <span style={drawerOpen ? { transform: "rotate(-45deg) translate(4px, -4px)" } : {}} />
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`db-drawer-overlay ${drawerOpen ? "open" : ""}`}>
          <div className="db-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="db-drawer">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        {/* Main */}
        <div className="db-main">

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
              Welcome back, {user.name?.split(" ")[0]} 👋
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              Here's what's happening with your handouts
            </div>
          </div>

          {/* KPI Cards */}
          <div className="db-kpi-grid">
            {STATS.map((s) => (
              <div key={s.label} className="db-kpi-card">
                <div className="db-kpi-top">
                  <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{loading ? "—" : s.value}</div>
              </div>
            ))}
          </div>

          {/* Recent Payments */}
          <div className="db-table-card">
            <div className="db-table-header">
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Payments</div>
              <button className="db-view-all" onClick={() => navigate("/rep/payments")}>View All</button>
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted }}>Loading...</div>
            ) : payments.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted }}>No payments yet</div>
            ) : (
              <>
                {/* Desktop table */}
                <table className="db-table">
                  <thead>
                    <tr style={{ background: "#141414" }}>
                      {["Student", "Handout", "Amount", "Status", "Date"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const sc = statusColor(p.status);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.student?.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{p.student?.student_id}</div>
                          </td>
                          <td style={{ fontSize: 13, color: C.muted }}>{p.handout?.title}</td>
                          <td style={{ fontSize: 13, fontWeight: 600, color: C.text }}>GHS {p.amount}</td>
                          <td>
                            <span className="db-badge" style={{ color: sc.color, background: sc.bg }}>{p.status}</span>
                          </td>
                          <td style={{ fontSize: 12, color: C.muted }}>{new Date(p.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile card list */}
                <div className="db-pay-list">
                  {payments.map((p) => {
                    const sc = statusColor(p.status);
                    return (
                      <div key={p.id} className="db-pay-row">
                        <div className="db-pay-icon">📄</div>
                        <div className="db-pay-info">
                          <div className="db-pay-name">{p.handout?.title}</div>
                          <div className="db-pay-sub">
                            {p.student?.name} · {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="db-pay-right">
                          <div className="db-pay-amount">GHS {p.amount}</div>
                          <span className="db-badge" style={{ color: sc.color, background: sc.bg }}>{p.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}