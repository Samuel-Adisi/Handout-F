import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
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

const card = {
  background: "#1a1a1a",
  borderRadius: 14,
  border: "1px solid #2e2e2e",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");

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
        const payments = paymentsRes.data;

        const handoutCount = courses.reduce((sum, c) => sum + (c.handout_count || 0), 0);
        const successful   = payments.filter((p) => p.status === "successful");
        const revenue      = successful.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        setStats({
          courses:  courses.length,
          handouts: handoutCount,
          payments: successful.length,
          revenue:  revenue.toFixed(2),
        });
        setPayments(payments.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STATS = [
    { label: "Total Courses",  value: stats.courses,  icon: "📚", color: "#6366f1" },
    { label: "Total Handouts", value: stats.handouts, icon: "📄", color: "#8b5cf6" },
    { label: "Payments",       value: stats.payments, icon: "💳", color: "#06b6d4" },
    { label: "Revenue (GHS)",  value: stats.revenue,  icon: "💰", color: "#16a34a" },
  ];

  const statusColor = (s) =>
    s === "successful" ? { color: "#4ade80", bg: "#052e16" }
    : s === "pending"  ? { color: "#fbbf24", bg: "#2d1f00" }
    :                    { color: "#f87171", bg: "#2d0f0f" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
            Welcome back, {user.name?.split(" ")[0]} 👋
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Here's what's happening with your handouts
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ ...card, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{loading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Payments */}
        <div style={{ ...card }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #2e2e2e",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Payments</div>
            <button
              onClick={() => navigate("/rep/payments")}
              style={{
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid #2e2e2e", background: "transparent",
                fontSize: 12, color: C.muted, cursor: "pointer", fontFamily: "inherit",
              }}
            >View All</button>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: C.muted }}>Loading...</div>
          ) : payments.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.muted }}>No payments yet</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#141414" }}>
                  {["Student", "Handout", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const sc = statusColor(p.status);
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #2e2e2e" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.student?.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{p.student?.student_id}</div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: C.muted }}>{p.handout?.title}</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: C.text }}>GHS {p.amount}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          color: sc.color, background: sc.bg,
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: C.muted }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}