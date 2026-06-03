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

const inputBase = {
  padding: "10px 14px",
  background: "#0f0f0f",
  border: "1px solid #2e2e2e",
  borderRadius: 8,
  fontSize: 13,
  color: "#ffffff",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const STATUS_COLOR = {
  successful: { color: "#4ade80", bg: "#052e16" },
  pending:    { color: "#fbbf24", bg: "#2d1f00" },
  failed:     { color: "#f87171", bg: "#2d0f0f" },
};
const statusColor = (s) => STATUS_COLOR[s] ?? { color: C.muted, bg: "#1a1a1a" };

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

  const STATS = [
    { label: "Total Payments", value: stats.total,      color: "#6366f1" },
    { label: "Successful",     value: stats.successful, color: "#4ade80" },
    { label: "Pending",        value: stats.pending,    color: "#fbbf24" },
    { label: "Revenue (GHS)",  value: stats.revenue,    color: "#06b6d4" },
  ];

  function PaymentCard({ p }) {
    const sc = statusColor(p.status);
    return (
      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Student + Amount */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.student?.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.student?.student_id}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>GHS {p.amount}</div>
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
      <style>{`
        * { box-sizing: border-box; }

        /* Stats: 4 col → 2 col on small screens */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }

        /* Filters: row, wrap on small */
        .filter-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .filter-search { flex: 1; min-width: 160px; }
        .filter-select { width: 160px; }
        @media (max-width: 480px) {
          .filter-select { width: 100%; }
        }

        /* Table hidden below 1024px */
        .table-wrapper { overflow-x: auto; }
        @media (max-width: 1023px) { .table-wrapper { display: none; } }

        /* Cards hidden at 1024px and above */
        .cards-wrapper { display: none; flex-direction: column; gap: 10px; }
        @media (max-width: 1023px) { .cards-wrapper { display: flex; } }

        /* Page padding tightens on mobile */
        .page-content { flex: 1; overflow-y: auto; padding: 24px; min-width: 0; }
        @media (max-width: 640px) { .page-content { padding: 16px; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
        <Sidebar />

        <div className="page-content">

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Payments</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Track all payments for your handouts</div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
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
          <div className="filter-row">
            <div className="filter-search">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, handout, reference..."
                style={inputBase}
              />
            </div>
            <div className="filter-select">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={inputBase}>
                <option value="">All Status</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No payments found.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="table-wrapper">
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
                            <td style={{ padding: "14px 20px", fontSize: 13, color: C.muted }}>{p.momo_number}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: C.text }}>GHS {p.amount}</td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{p.reference}</span>
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg }}>
                                {p.status}
                              </span>
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
              </div>

              {/* Mobile / tablet cards */}
              <div className="cards-wrapper">
                {filtered.map((p) => <PaymentCard key={p.id} p={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}