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
  greenBg:   "#052e16",
  yellow:    "#fbbf24",
  red:       "#f87171",
  error:     "#ef4444",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }

  .hp-page {
    min-height: 100vh;
    background: ${C.bg};
    font-family: 'DM Sans', system-ui, sans-serif;
    color: ${C.text};
  }

  .hp-nav {
    position: sticky; top: 0; z-index: 40;
    background: ${C.surface}ee;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${C.border};
    padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .hp-logo { display: flex; align-items: center; gap: 10px; cursor: default; }

  .hp-logo-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: ${C.accent};
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.5px;
  }

  .hp-logo-text { font-size: 15px; font-weight: 600; color: ${C.text}; letter-spacing: -0.3px; }

  .hp-nav-links { display: flex; align-items: center; gap: 4px; }

  .hp-nav-link {
    padding: 6px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; border: none; background: transparent;
    font-family: inherit; color: ${C.muted}; text-decoration: none;
  }
  .hp-nav-link:hover { background: ${C.elevated}; color: ${C.text}; }
  .hp-nav-link.active { background: ${C.accentDim}; color: ${C.accent}; font-weight: 600; }

  .hp-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, ${C.accent}, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff; margin-left: 8px; flex-shrink: 0;
  }

  .hp-logout {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 12px; color: ${C.muted}; cursor: pointer;
    font-family: inherit; transition: all 0.15s; margin-left: 4px;
  }
  .hp-logout:hover { background: ${C.elevated}; color: ${C.text}; }

  .hp-main { max-width: 1100px; margin: 0 auto; padding: 36px 32px; }
  .hp-header { margin-bottom: 32px; }
  .hp-title { font-size: 26px; font-weight: 700; color: ${C.text}; letter-spacing: -0.5px; margin-bottom: 4px; }
  .hp-subtitle { font-size: 14px; color: ${C.muted}; }

  .hp-filters { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }

  .hp-input {
    padding: 9px 14px; background: ${C.elevated};
    border: 1px solid ${C.border}; border-radius: 10px;
    font-size: 13px; color: ${C.text}; outline: none;
    font-family: 'DM Sans', inherit; transition: border-color 0.15s; appearance: none;
  }
  .hp-input::placeholder { color: ${C.muted}; }
  .hp-input:focus { border-color: ${C.accent}; }

  .hp-stats { display: flex; gap: 6px; margin-bottom: 28px; flex-wrap: wrap; }
  .hp-stat-pill {
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
    background: ${C.elevated}; border: 1px solid ${C.border}; color: ${C.muted};
  }
  .hp-stat-pill span { font-weight: 700; color: ${C.text}; margin-right: 3px; }

  .hp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  .hp-card {
    background: ${C.elevated}; border: 1px solid ${C.border};
    border-radius: 16px; padding: 22px;
    display: flex; flex-direction: column; gap: 0;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.3s ease both;
  }
  .hp-card:hover {
    border-color: ${C.borderHover}; transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  .hp-skel-card {
    border-radius: 16px; min-height: 180px;
    border: 1px solid ${C.border};
    background: linear-gradient(90deg, #18181c 25%, #242428 50%, #18181c 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hp-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }

  .hp-course-badge {
    padding: 4px 10px; border-radius: 6px;
    background: ${C.accentDim}; border: 1px solid ${C.accent}40;
    font-size: 11px; font-weight: 700; color: ${C.accent};
    font-family: 'DM Mono', monospace; letter-spacing: 0.3px;
  }

  .hp-stock { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .hp-stock::before { content: ''; width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
  .hp-stock.green { color: ${C.green}; }
  .hp-stock.green::before { background: ${C.green}; }
  .hp-stock.yellow { color: ${C.yellow}; }
  .hp-stock.yellow::before { background: ${C.yellow}; }
  .hp-stock.red { color: ${C.red}; }
  .hp-stock.red::before { background: ${C.red}; }

  .hp-card-title { font-size: 15px; font-weight: 600; color: ${C.text}; margin-bottom: 6px; letter-spacing: -0.2px; line-height: 1.4; }
  .hp-card-desc { font-size: 12.5px; color: ${C.muted}; line-height: 1.55; flex: 1; margin-bottom: 18px; min-height: 38px; }

  .hp-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 16px; border-top: 1px solid ${C.border};
  }

  .hp-price { font-size: 22px; font-weight: 700; color: ${C.text}; letter-spacing: -0.5px; }
  .hp-price-currency { font-size: 13px; font-weight: 500; color: ${C.muted}; margin-right: 2px; }

  .hp-pay-btn {
    padding: 9px 18px; border-radius: 9px; border: none;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', inherit; transition: all 0.15s;
    background: ${C.accent}; color: #fff;
  }
  .hp-pay-btn:hover:not(:disabled) { background: ${C.accentHover}; transform: translateY(-1px); }
  .hp-pay-btn:disabled {
    background: ${C.elevated}; color: ${C.subtle};
    cursor: not-allowed; border: 1px solid ${C.border};
  }

  .hp-empty { text-align: center; padding: 80px 20px; color: ${C.muted}; }
  .hp-empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.5; }
  .hp-empty-title { font-size: 16px; font-weight: 600; color: ${C.text}; margin-bottom: 6px; }

  .hp-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 100; padding: 20px;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .hp-modal {
    background: ${C.elevated}; border: 1px solid ${C.border};
    border-radius: 20px; padding: 28px; width: 100%; max-width: 420px;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hp-modal-header { margin-bottom: 20px; }
  .hp-modal-title { font-size: 17px; font-weight: 700; color: ${C.text}; letter-spacing: -0.3px; margin-bottom: 2px; }
  .hp-modal-sub { font-size: 13px; color: ${C.muted}; }

  .hp-summary {
    background: ${C.bg}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;
  }
  .hp-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
  .hp-summary-row:not(:last-child) { border-bottom: 1px solid ${C.border}; padding-bottom: 8px; margin-bottom: 3px; }
  .hp-summary-label { font-size: 12px; color: ${C.muted}; }
  .hp-summary-value { font-size: 12px; font-weight: 600; color: ${C.text}; }
  .hp-summary-value.amount { font-size: 16px; font-weight: 700; color: ${C.accent}; font-family: 'DM Mono', monospace; }

  .hp-field-label { font-size: 12px; font-weight: 600; color: ${C.muted}; display: block; margin-bottom: 7px; }
  .hp-field-input {
    width: 100%; padding: 11px 14px; background: ${C.bg};
    border: 1px solid ${C.border}; border-radius: 10px;
    font-size: 14px; color: ${C.text}; outline: none;
    font-family: 'DM Sans', inherit; transition: border-color 0.15s; margin-bottom: 20px;
  }
  .hp-field-input:focus { border-color: ${C.accent}; }
  .hp-field-input::placeholder { color: ${C.muted}; }

  /* OTP input — large centered digits */
  .hp-otp-input {
    width: 100%; padding: 16px 14px; background: ${C.bg};
    border: 1px solid ${C.border}; border-radius: 10px;
    font-size: 28px; font-weight: 700; color: ${C.accent};
    outline: none; font-family: 'DM Mono', monospace;
    transition: border-color 0.15s; margin-bottom: 8px;
    text-align: center; letter-spacing: 10px;
  }
  .hp-otp-input:focus { border-color: ${C.accent}; }
  .hp-otp-input::placeholder { color: ${C.subtle}; font-size: 20px; letter-spacing: 6px; }

  .hp-otp-hint {
    font-size: 12px; color: ${C.muted}; text-align: center;
    margin-bottom: 20px; line-height: 1.5;
  }
  .hp-otp-hint strong { color: ${C.text}; }

  .hp-resend {
    background: none; border: none; color: ${C.accent};
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', inherit; padding: 0;
    text-decoration: underline; margin-top: 12px;
    display: block; text-align: center; width: 100%;
  }
  .hp-resend:disabled { color: ${C.muted}; text-decoration: none; cursor: not-allowed; }

  .hp-step-indicator {
    display: flex; align-items: center; gap: 6px; margin-bottom: 20px;
  }
  .hp-step {
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%;
    font-size: 11px; font-weight: 700;
  }
  .hp-step.done { background: ${C.accent}; color: #fff; }
  .hp-step.active { background: ${C.accentDim}; border: 1.5px solid ${C.accent}; color: ${C.accent}; }
  .hp-step.pending { background: ${C.bg}; border: 1.5px solid ${C.border}; color: ${C.muted}; }
  .hp-step-line { flex: 1; height: 1px; background: ${C.border}; }
  .hp-step-line.done { background: ${C.accent}; }

  .hp-alert { border-radius: 10px; padding: 11px 14px; font-size: 13px; margin-bottom: 16px; font-weight: 500; }
  .hp-alert.error { background: #2d141430; border: 1px solid ${C.error}50; color: ${C.error}; }
  .hp-alert.success { background: #052e1630; border: 1px solid #16a34a50; color: ${C.green}; }

  .hp-modal-actions { display: flex; gap: 10px; }

  .hp-btn-cancel {
    flex: 1; padding: 11px; border-radius: 10px;
    border: 1px solid ${C.border}; background: transparent;
    font-size: 13px; font-weight: 600; color: ${C.muted};
    cursor: pointer; font-family: 'DM Sans', inherit; transition: all 0.15s;
  }
  .hp-btn-cancel:hover { background: ${C.surface}; color: ${C.text}; }

  .hp-btn-pay {
    flex: 2; padding: 11px; border-radius: 10px; border: none;
    background: ${C.accent}; font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'DM Sans', inherit; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .hp-btn-pay:hover:not(:disabled) { background: ${C.accentHover}; }
  .hp-btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }

  .hp-spinner {
    width: 14px; height: 14px;
    border: 2px solid #ffffff40; border-top-color: #fff;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .hp-nav { padding: 0 16px; }
    .hp-main { padding: 24px 16px; }
    .hp-title { font-size: 20px; }
    .hp-filters { flex-direction: column; }
    .hp-input { width: 100% !important; }
  }
`;

// step: "momo" | "otp" | "success"
export default function StudentHandouts() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [search,       setSearch]       = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [momoNumber,   setMomoNumber]   = useState("");
  const [paying,       setPaying]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  // OTP state
  const [step,         setStep]         = useState("momo"); // "momo" | "otp" | "success"
  const [otp,          setOtp]          = useState("");
  const [reference,  setReference]  = useState("");
  const [paymentId,  setPaymentId]  = useState("");
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: handouts = [], isLoading: loadingHandouts } = useQuery({
    queryKey: ["handouts"],
    queryFn: () => api.get("/handouts/").then(r => r.data),
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get("/courses/").then(r => r.data),
  });

  const loading = loadingHandouts || loadingCourses;

  function handleLogout() {
    queryClient.clear();
    localStorage.clear();
    navigate("/login");
  }

  function openPay(handout) {
    setSelected(handout);
    setMomoNumber(user.phone || "");
    setError("");
    setSuccess("");
    setStep("momo");
    setOtp("");
    setReference("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setStep("momo");
    setOtp("");
    setReference("");
    setError("");
    setSuccess("");
  }

  // mask phone number for display e.g. 024*****67
  function maskPhone(phone) {
    if (!phone || phone.length < 4) return phone;
    return phone.slice(0, 3) + "*".repeat(phone.length - 5) + phone.slice(-2);
  }

  // Step 1 — initiate payment
  async function handlePay() {
    if (!momoNumber.trim()) { setError("Please enter your MoMo number."); return; }
    setPaying(true);
    setError("");
    try {
      const res = await api.post("/payments/initiate/", {
        handout_id:  selected.id,
        momo_number: momoNumber,
      });
      const nextStep = res.data?.next_step;
      const ref      = res.data?.reference;
      setReference(ref);
      setPaymentId(res.data?.payment_id);


      if (nextStep === "send_otp") {
        // SMS OTP flow — show OTP input
        setStep("otp");
        startResendCooldown();
      } else if (nextStep === "success") {
        // instant success (unlikely but handle it)
        setStep("success");
      } else {
        // fallback — assume OTP needed
        setStep("otp");
        startResendCooldown();
      }
    } catch (err) {
      const errs = err.response?.data;
      if (typeof errs === "object") {
        setError(Object.values(errs).flat().join(" "));
      } else {
        setError("Payment failed. Please try again.");
      }
    } finally {
      setPaying(false);
    }
  }




  async function pollPaymentStatus(ref) {
  setError("OTP submitted. Waiting for confirmation...");
  let attempts = 0;
  const maxAttempts = 10;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await api.get(`/payments/${ref}/status/`);
      const paymentStatus = res.data?.status;

      if (paymentStatus === "successful") {
        clearInterval(interval);
        setStep("success");
      } else if (paymentStatus === "failed") {
        clearInterval(interval);
        setError("Payment failed. Please try again.");
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setError("Payment is taking longer than expected. Check My Payments for status.");
      }
    } catch (err) {
      clearInterval(interval);
    }
  }, 3000);
}



  // Step 2 — submit OTP
  async function handleSubmitOtp() {
    if (!otp.trim() || otp.length < 4) { setError("Please enter the OTP from your SMS."); return; }
    setSubmittingOtp(true);
    setError("");
    try {
      const res = await api.post("/payments/submit-otp/", {
        otp,
        reference,
      });
      const msg = res.data?.message || "";
      // Replace:
      if (msg.includes("approved") || msg.includes("success")) {
        setStep("success");
      } else {
      const res = await api.get(`/payments/${ref}/status/`);
      }
    } catch (err) {
      const errs = err.response?.data;
      if (typeof errs === "object") {
        setError(Object.values(errs).flat().join(" "));
      } else {
        setError("Invalid OTP. Please check and try again.");
      }
    } finally {
      setSubmittingOtp(false);
    }
  }

  // Resend cooldown timer
  function startResendCooldown() {
    setResendCooldown(30);
    const id = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setPaying(true);
    setError("");
    setOtp("");
    try {
      const res = await api.post("/payments/initiate/", {
        handout_id:  selected.id,
        momo_number: momoNumber,
      });
      setReference(res.data?.reference);
      startResendCooldown();
    } catch (err) {
      setError("Could not resend OTP. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  const filtered = handouts.filter((h) => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse ? h.course?.id === parseInt(filterCourse) : true;
    return matchSearch && matchCourse;
  });

  const inStock    = filtered.filter(h => h.in_stock).length;
  const outOfStock = filtered.filter(h => !h.in_stock).length;

  function stockClass(h) {
    if (!h.in_stock) return "red";
    if (h.stock <= 10) return "yellow";
    return "green";
  }

  function stockLabel(h) {
    if (!h.in_stock) return "Out of stock";
    if (h.stock <= 10) return `${h.stock} left`;
    return `${h.stock} in stock`;
  }

  // Step indicator helper
  function StepIndicator() {
    const s1 = step === "momo" ? "active" : "done";
    const s2 = step === "otp" ? "active" : step === "success" ? "done" : "pending";
    const s3 = step === "success" ? "active" : "pending";
    const l1 = step !== "momo" ? "done" : "";
    const l2 = step === "success" ? "done" : "";
    return (
      <div className="hp-step-indicator">
        <div className={`hp-step ${s1}`}>1</div>
        <div className={`hp-step-line ${l1}`} />
        <div className={`hp-step ${s2}`}>2</div>
        <div className={`hp-step-line ${l2}`} />
        <div className={`hp-step ${s3}`}>3</div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="hp-page">

        <nav className="hp-nav">
          <div className="hp-logo">
            <div className="hp-logo-icon">H</div>
            <span className="hp-logo-text">Handout Pay</span>
          </div>
          <div className="hp-nav-links">
            <span className="hp-nav-link active" onClick={() => navigate("/student/handouts")}>Handouts</span>
            <span className="hp-nav-link" onClick={() => navigate("/student/payments")}>My Payments</span>
            <div className="hp-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <button className="hp-logout" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="hp-main">
          <div className="hp-header">
            <div className="hp-title">Browse Handouts</div>
            <div className="hp-subtitle">Find and pay for your course materials</div>
          </div>

          <div className="hp-filters">
            <input
              className="hp-input"
              style={{ width: 280 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handouts..."
            />
            <select
              className="hp-input"
              style={{ width: 220 }}
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          {!loading && handouts.length > 0 && (
            <div className="hp-stats">
              <div className="hp-stat-pill"><span>{filtered.length}</span> handouts</div>
              <div className="hp-stat-pill"><span>{inStock}</span> available</div>
              {outOfStock > 0 && <div className="hp-stat-pill"><span>{outOfStock}</span> out of stock</div>}
              {courses.length > 0 && <div className="hp-stat-pill"><span>{courses.length}</span> courses</div>}
            </div>
          )}

          {loading ? (
            <div className="hp-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="hp-skel-card" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="hp-empty">
              <div className="hp-empty-icon">📭</div>
              <div className="hp-empty-title">No handouts found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or filter</div>
            </div>
          ) : (
            <div className="hp-grid">
              {filtered.map((h, i) => (
                <div key={h.id} className="hp-card" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="hp-card-top">
                    <span className="hp-course-badge">{h.course?.code}</span>
                    <span className={`hp-stock ${stockClass(h)}`}>{stockLabel(h)}</span>
                  </div>
                  <div className="hp-card-title">{h.title}</div>
                  <div className="hp-card-desc">{h.description || "No description provided."}</div>
                  <div className="hp-card-footer">
                    <div className="hp-price">
                      <span className="hp-price-currency">GHS</span>{h.price}
                    </div>
                    <button className="hp-pay-btn" onClick={() => openPay(h)} disabled={!h.in_stock}>
                      {h.in_stock ? "Pay with MoMo" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Modal ── */}
        {showModal && selected && (
          <div className="hp-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="hp-modal">

              {/* ── Step: MoMo number ── */}
              {step === "momo" && (
                <>
                  <div className="hp-modal-header">
                    <div className="hp-modal-title">Complete Payment</div>
                    <div className="hp-modal-sub">Pay with Mobile Money</div>
                  </div>
                  <StepIndicator />
                  <div className="hp-summary">
                    {[
                      { label: "Handout", value: selected.title },
                      { label: "Course",  value: selected.course?.code },
                      { label: "Amount",  value: `GHS ${selected.price}`, amount: true },
                    ].map(({ label, value, amount }) => (
                      <div key={label} className="hp-summary-row">
                        <span className="hp-summary-label">{label}</span>
                        <span className={`hp-summary-value${amount ? " amount" : ""}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {error && <div className="hp-alert error">{error}</div>}
                  <label className="hp-field-label">MoMo Number</label>
                  <input
                    className="hp-field-input"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="e.g. 0241234567"
                  />
                  <div className="hp-modal-actions">
                    <button className="hp-btn-cancel" onClick={closeModal}>Cancel</button>
                    <button className="hp-btn-pay" onClick={handlePay} disabled={paying}>
                      {paying ? <><div className="hp-spinner" /> Processing...</> : "Pay Now"}
                    </button>
                  </div>
                </>
              )}

              {/* ── Step: OTP entry ── */}
              {step === "otp" && (
                <>
                  <div className="hp-modal-header">
                    <div className="hp-modal-title">Enter OTP</div>
                    <div className="hp-modal-sub">Confirm your payment</div>
                  </div>
                  <StepIndicator />
                  {error && <div className="hp-alert error">{error}</div>}
                  <div className="hp-otp-hint">
                    An OTP was sent to <strong>{maskPhone(momoNumber)}</strong> via SMS.
                    Enter the code below to approve the payment of{" "}
                    <strong style={{ color: C.accent }}>GHS {selected.price}</strong>.
                  </div>
                  <input
                    className="hp-otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="······"
                    maxLength={6}
                    autoFocus
                  />
                  <div className="hp-modal-actions">
                    <button className="hp-btn-cancel" onClick={closeModal}>Cancel</button>
                    <button className="hp-btn-pay" onClick={handleSubmitOtp} disabled={submittingOtp || otp.length < 4}>
                      {submittingOtp ? <><div className="hp-spinner" /> Verifying...</> : "Confirm Payment"}
                    </button>
                  </div>
                  <button
                    className="hp-resend"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || paying}
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : paying ? "Sending..." : "Didn't get a code? Resend"}
                  </button>
                </>
              )}

              {/* ── Step: Success ── */}
              {step === "success" && (
                <>
                  <div className="hp-modal-header">
                    <div className="hp-modal-title">Payment Successful 🎉</div>
                    <div className="hp-modal-sub">Your handout has been unlocked</div>
                  </div>
                  <StepIndicator />
                  <div className="hp-alert success">
                    ✓ Payment confirmed for <strong>{selected.title}</strong>. You can now access your handout.
                  </div>
                  <div className="hp-summary">
                    {[
                      { label: "Handout", value: selected.title },
                      { label: "Course",  value: selected.course?.code },
                      { label: "Amount",  value: `GHS ${selected.price}`, amount: true },
                      { label: "Status",  value: "✓ Paid" },
                    ].map(({ label, value, amount }) => (
                      <div key={label} className="hp-summary-row">
                        <span className="hp-summary-label">{label}</span>
                        <span className={`hp-summary-value${amount ? " amount" : ""}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="hp-btn-pay"
                    style={{ width: "100%" }}
                    onClick={() => { closeModal(); navigate("/student/payments"); }}
                  >
                    View My Payments
                  </button>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );
}