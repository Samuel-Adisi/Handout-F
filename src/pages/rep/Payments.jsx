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
  padding: "10px 14px",
  background: "#0f0f0f",
  border: "1px solid #2e2e2e",
  borderRadius: 8,
  fontSize: 13,
  color: "#ffffff",
  outline: "none",
  fontFamily: "inherit",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("");
  const [stats,    setStats]    = useState({ total: 0, successful: 0, pending: 0, revenue: 0 });

  async function load() {
    try {
      const { data } = await api.get("/payments/rep/");
      setPayments(data);

      const successful = data.filter((p) => p.status === "successful");
      const pending    = data.filter((p) => p.status === "pending");
      const revenue    = successful.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      setStats({
        total:      data.length,
        successful: successful.length,
        pending:    pending.length,
        revenue:    revenue.toFixed(2),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const statusColor = (s) =>
    s === "successful" ? { color: "#4ade80", bg: "#052e16" }
    : s === "pending"  ? { color: "#fbbf24", bg: "#2d1f00" }
    : s === "failed"   ? { color: "#f87171", bg: "#2d0f0f" }
    :                    { color: C.muted,   bg: "#1a1a1a" };

  const filtered = payments.filter((p) => {
    const matchSearch = (
      p.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.student?.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.handout?.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase())
    );
    const matchFilter = filter ? p.status === filter : true;
    return matchSearch && matchFilter;
  });

  const STATS = [
    { label: "Total Payments",   value: stats.total,      color: "#6366f1" },
    { label: "Successful",       value: stats.successful, color: "#4ade80" },
    { label: "Pending",          value: stats.pending,    color: "#fbbf24" },
    { label: "Revenue (GHS)",    value: stats.revenue,    color: "#06b6d4" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Payments</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Track all payments for your handouts</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ ...card, padding: 18 }}>
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
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, handout, reference..."
            style={{ ...input, width: 320 }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ ...input, width: 160 }}
          >
            <option value="">All Status</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No payments found.</div>
        ) : (
          <div style={{ ...card }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#141414" }}>
                  {["Student", "Handout", "MoMo Number", "Amount", "Reference", "Status", "Date"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sc = statusColor(p.status);
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #2e2e2e" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.student?.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{p.student?.student_id}</div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: 13, color: C.text }}>{p.handout?.title}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{p.handout?.course?.code}</div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: C.muted }}>
                        {p.momo_number}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: C.text }}>
                        GHS {p.amount}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontSize: 11, color: C.muted,
                          fontFamily: "monospace",
                        }}>{p.reference}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          color: sc.color, background: sc.bg,
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}