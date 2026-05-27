import { useNavigate, useLocation } from "react-router-dom";

const C = {
  bg:      "#0f0f0f",
  surface: "#1a1a1a",
  border:  "#2e2e2e",
  accent:  "#6366f1",
  text:    "#ffffff",
  muted:   "#9CA3AF",
};

const NAV = [
  { label: "Dashboard", path: "/rep/dashboard", icon: "⊞" },
  { label: "Courses",   path: "/rep/courses",   icon: "📚" },
  { label: "Handouts",  path: "/rep/handouts",  icon: "📄" },
  { label: "Payments",  path: "/rep/payments",  icon: "💳" },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div style={{
      width: 220, minHeight: "100vh",
      background: C.surface, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff",
        }}>H</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Handout Pay</div>
          <div style={{ fontSize: 10, color: C.muted }}>Rep Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                cursor: "pointer",
                background: active ? C.accent : "transparent",
                color: active ? "#fff" : C.muted,
                fontSize: 13, fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>

      {/* User + Logout */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", marginBottom: 4,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: C.accent, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>
            {user.name?.[0]?.toUpperCase() || "R"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{user.student_id}</div>
          </div>
        </div>
        <div
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8,
            cursor: "pointer", color: "#ef4444", fontSize: 13,
          }}
        >
          <span>🚪</span> Logout
        </div>
      </div>
    </div>
  );
}