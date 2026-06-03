import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const C = {
  bg:        "#080809",
  surface:   "#111113",
  elevated:  "#18181c",
  border:    "#242428",
  borderHover: "#3a3a42",
  accent:    "#6366f1",
  accentDim: "#6366f120",
  accentHover: "#5254cc",
  text:      "#f0f0f5",
  muted:     "#7c7c8a",
  subtle:    "#3a3a42",
  green:     "#4ade80",
  yellow:    "#fbbf24",
  red:       "#f87171",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }

  .mp-page {
    min-height: 100vh;
    background: ${C.bg};
    font-family: 'DM Sans', system-ui, sans-serif;
    color: ${C.text};
  }

  /* ── NAV ── */
  .mp-nav {
    position: sticky; top: 0; z-index: 40;
    background: ${C.surface}ee;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${C.border};
    padding: 0 20px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .mp-logo { display: flex; align-items: center; gap: 10px; }

  .mp-logo-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: ${C.accent};
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; color: #fff; flex-shrink: 0;
  }

  .mp-logo-text { font-size: 15px; font-weight: 600; color: ${C.text}; letter-spacing: -0.3px; }

  .mp-nav-links { display: flex; align-items: center; gap: 4px; }

  .mp-nav-link {
    padding: 6px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; border: none; background: transparent;
    font-family: inherit; color: ${C.muted}; text-decoration: none;
    white-space: nowrap;
  }
  .mp-nav-link:hover { background: ${C.elevated}; color: ${C.text}; }
  .mp-nav-link.active { background: ${C.accentDim}; color: ${C.accent}; font-weight: 600; }

  .mp-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, ${C.accent}, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
  }

  .mp-logout {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 12px; color: ${C.muted}; cursor: pointer;
    font-family: inherit; transition: all 0.15s;
  }
  .mp-logout:hover { background: ${C.elevated}; color: ${C.text}; }

  /* hamburger */
  .mp-hamburger {
    display: none;
    flex-direction: column; justify-content: center; align-items: center;
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    cursor: pointer; gap: 5px; flex-shrink: 0;
  }
  .mp-hamburger span {
    display: block; width: 16px; height: 1.5px;
    background: ${C.muted}; border-radius: 2px; transition: all 0.2s;
  }

  /* mobile drawer */
  .mp-drawer {
    position: fixed; top: 60px; left: 0; right: 0; z-index: 39;
    background: ${C.surface};
    border-bottom: 1px solid ${C.border};
    padding: 12px 16px 16px;
    display: flex; flex-direction: column; gap: 6px;
    transform: translateY(-120%);
    transition: transform 0.25s ease;
  }
  .mp-drawer.open { transform: translateY(0); }
  .mp-drawer .mp-nav-link { padding: 12px 14px; font-size: 14px; }

  .mp-drawer-footer {
    display: flex; align-items: center; gap: 10px;
    padding-top: 12px; margin-top: 4px;
    border-top: 1px solid ${C.border};
  }

  /* ── MAIN ── */
  .mp-main { max-width: 800px; margin: 0 auto; padding: 28px 20px; }
  .mp-header { margin-bottom: 24px; }
  .mp-title { font-size: 22px; font-weight: 700; color: ${C.text}; letter-spacing: -0.5px; margin-bottom: 4px; }
  .mp-subtitle { font-size: 14px; color: ${C.muted}; }

  /* ── SKELETON ── */
  .mp-skeleton {
    background: ${C.elevated}; border: 1px solid ${C.border};
    border-radius: 14px; padding: 16px;
    display: flex; align-items: center; gap: 14px; margin-bottom: 10px;
  }

  .mp-skel-circle {
    width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(90deg, ${C.elevated} 25%, ${C.border} 50%, ${C.elevated} 75%);
    background-size: 200% 100%; animation: shimmer 1.5s infinite;
  }

  .mp-skel-line {
    height: 12px; border-radius: 6px; margin-bottom: 8px;
    background: linear-gradient(90deg, ${C.elevated} 25%, ${C.border} 50%, ${C.elevated} 75%);
    background-size: 200% 100%; animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── PAYMENT ROW ── */
  .mp-row {
    background: ${C.elevated}; border: 1px solid ${C.border};
    border-radius: 14px; padding: 16px;
    display: flex; align-items: center; gap: 14px;
    transition: border-color 0.2s, transform 0.15s;
    animation: fadeUp 0.3s ease both; margin-bottom: 10px;
  }
  .mp-row:hover { border-color: ${C.borderHover}; transform: translateY(-1px); }

  .mp-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: #1e1b4b; border: 1px solid #3730a3;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }

  .mp-info { flex: 1; min-width: 0; }
  .mp-name {
    font-size: 14px; font-weight: 600; color: ${C.text};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mp-meta { font-size: 12px; color: ${C.muted}; margin-top: 3px; }

  .mp-amount-col { text-align: right; flex-shrink: 0; }
  .mp-amount { font-size: 15px; font-weight: 700; color: ${C.text}; margin-bottom: 5px; font-family: 'DM Mono', monospace; }

  .mp-badge { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; }

  .mp-date-col { text-align: right; flex-shrink: 0; min-width: 80px; }
  .mp-date { font-size: 11px; color: ${C.muted}; }
  .mp-confirmed { font-size: 11px; color: ${C.green}; margin-top: 3px; }

  /* ── EMPTY ── */
  .mp-empty {
    background: ${C.elevated}; border: 1px solid ${C.border};
    border-radius: 14px; padding: 60px 20px; text-align: center;
  }
  .mp-empty-icon { font-size: 36px; margin-bottom: 14px; opacity: 0.6; }
  .mp-empty-title { font-size: 16px; font-weight: 600; color: ${C.text}; margin-bottom: 6px; }
  .mp-empty-sub { font-size: 13px; color: ${C.muted}; margin-bottom: 20px; }
  .mp-browse-btn {
    padding: 12px 22px; background: ${C.accent};
    color: #fff; border: none; border-radius: 9px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: background 0.15s; min-height: 44px;
  }
  .mp-browse-btn:hover { background: ${C.accentHover}; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .mp-nav { padding: 0 16px; }
    .mp-main { padding: 22px 16px; }
    .mp-title { font-size: 20px; }

    .mp-nav-links { display: none; }
    .mp-hamburger { display: flex; }

    /* on mobile: stack amount + badge below name/meta */
    .mp-row { flex-wrap: wrap; gap: 10px; padding: 14px; }
    .mp-info { min-width: 0; flex: 1 1 calc(100% - 58px); }
    .mp-amount-col { flex: 0 0 auto; }
    .mp-date-col { display: none; }

    /* show date inline under meta on mobile */
    .mp-meta-date {
      display: inline !important;
      margin-left: 4px;
    }
  }

  @media (max-width: 400px) {
    .mp-nav { padding: 0 12px; height: 56px; }
    .mp-logo-text { font-size: 14px; }
    .mp-main { padding: 18px 12px; }
    .mp-title { font-size: 18px; }
    .mp-row { padding: 12px; }
    .mp-icon { width: 38px; height: 38px; font-size: 17px; }
    .mp-amount { font-size: 14px; }
    .mp-name { font-size: 13px; }
  }

  @media (min-width: 769px) {
    .mp-drawer { display: none !important; }
    .mp-nav { padding: 0 32px; }
    .mp-main { padding: 36px 32px; }
    .mp-meta-date { display: none; }
  }
`;

function statusStyle(s) {
  if (s === "successful") return { color: "#4ade80", background: "#052e16" };
  if (s === "pending")    return { color: "#fbbf24", background: "#2d1f00" };
  if (s === "failed")     return { color: "#f87171", background: "#2d0f0f" };
  return { color: C.muted, background: C.elevated };
}

function SkeletonRows() {
  return (
    <>
      {[1,2,3,4].map(i => (
        <div key={i} className="mp-skeleton">
          <div className="mp-skel-circle" />
          <div style={{ flex: 1 }}>
            <div className="mp-skel-line" style={{ width: "60%" }} />
            <div className="mp-skel-line" style={{ width: "35%" }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mp-skel-line" style={{ width: 60 }} />
            <div className="mp-skel-line" style={{ width: 50 }} />
          </div>
        </div>
      ))}
    </>
  );
}

export default function MyPayments() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => api.get("/payments/my/").then(r => r.data),
  });

  function handleLogout() {
    queryClient.clear();
    localStorage.clear();
    navigate("/login");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="mp-page">

        {/* ── NAV ── */}
        <nav className="mp-nav">
          <div className="mp-logo">
            <div className="mp-logo-icon">H</div>
            <span className="mp-logo-text">Handout Pay</span>
          </div>

          {/* Desktop links */}
          <div className="mp-nav-links">
            <span className="mp-nav-link" onClick={() => navigate("/student/handouts")}>Handouts</span>
            <span className="mp-nav-link active">My Payments</span>
            <div className="mp-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <button className="mp-logout" onClick={handleLogout}>Logout</button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="mp-hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Menu"
          >
            <span style={drawerOpen ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
            <span style={drawerOpen ? { opacity: 0 } : {}} />
            <span style={drawerOpen ? { transform: "rotate(-45deg) translate(4px, -4px)" } : {}} />
          </button>
        </nav>

        {/* Mobile drawer */}
        <div className={`mp-drawer ${drawerOpen ? "open" : ""}`}>
          <span className="mp-nav-link" onClick={() => { navigate("/student/handouts"); setDrawerOpen(false); }}>
            Handouts
          </span>
          <span className="mp-nav-link active" onClick={() => setDrawerOpen(false)}>
            My Payments
          </span>
          <div className="mp-drawer-footer">
            <div className="mp-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 13, color: C.muted, flex: 1 }}>{user.name || "Student"}</span>
            <button className="mp-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Drawer backdrop */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 38,
              background: "rgba(0,0,0,0.4)",
            }}
          />
        )}

        <div className="mp-main">
          <div className="mp-header">
            <div className="mp-title">My Payments</div>
            <div className="mp-subtitle">Your complete payment history</div>
          </div>

          {isLoading ? (
            <SkeletonRows />
          ) : payments.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty-icon">💳</div>
              <div className="mp-empty-title">No payments yet</div>
              <div className="mp-empty-sub">Browse handouts and make your first payment</div>
              <button className="mp-browse-btn" onClick={() => navigate("/student/handouts")}>
                Browse Handouts
              </button>
            </div>
          ) : (
            <div>
              {payments.map((p, i) => {
                const sc = statusStyle(p.status);
                return (
                  <div key={p.id} className="mp-row" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="mp-icon">📄</div>
                    <div className="mp-info">
                      <div className="mp-name">{p.handout?.title}</div>
                      <div className="mp-meta">
                        {p.handout?.course?.code} · Ref: {p.reference}
                        {/* date shown inline on mobile only */}
                        <span className="mp-meta-date" style={{ display: "none" }}>
                          {" · "}{new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mp-amount-col">
                      <div className="mp-amount">GHS {p.amount}</div>
                      <span className="mp-badge" style={sc}>{p.status}</span>
                    </div>
                    <div className="mp-date-col">
                      <div className="mp-date">{new Date(p.created_at).toLocaleDateString()}</div>
                      {p.confirmed_at && <div className="mp-confirmed">✓ Confirmed</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}