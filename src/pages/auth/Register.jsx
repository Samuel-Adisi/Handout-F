import { useState } from "react";
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

function Field({ label, type = "text", value, onChange, placeholder, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: C.bg,
          border: `1px solid ${focused ? C.accent : C.border}`,
          borderRadius: 8,
          fontSize: 14,
          color: C.text,
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
      />
      {hint && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

export default function Register() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [tab, setTab] = useState(
    location.pathname.includes("rep") ? "rep" : "student"
  );

  const emptyStudent = { name: "", student_id: "", phone: "", password: "", confirmPassword: "" };
  const emptyRep     = { name: "", student_id: "", phone: "", password: "", confirmPassword: "", invite_code: "" };

  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [repForm,     setRepForm]     = useState(emptyRep);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  const form    = tab === "student" ? studentForm : repForm;
  const setForm = tab === "student" ? setStudentForm : setRepForm;

  function switchTab(t) {
    setTab(t);
    setError("");
  }

  async function handleSubmit() {
    setError("");

    if (!form.name.trim() || !form.student_id.trim() || !form.phone.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (tab === "rep" && !repForm.invite_code.trim()) {
      setError("Invite code is required for rep registration.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = tab === "student"
        ? "/accounts/register/"
        : "/accounts/register/rep/";

      const payload = { ...form };
      delete payload.confirmPassword;

      await api.post(endpoint, payload);
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        // DRF returns { field: ["error msg"] } — grab the first one
        const firstKey   = Object.keys(data)[0];
        const firstValue = data[firstKey];
        const msg = Array.isArray(firstValue) ? firstValue[0] : firstValue;
        setError(typeof msg === "string" ? msg : "Something went wrong.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "48px 36px", width: "100%", maxWidth: 400,
          textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#052e16", border: "1px solid #16a34a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 20px", color: "#4ade80",
          }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            Account created!
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>
            {tab === "student"
              ? "Your student account is ready. Sign in to browse handouts."
              : "Your rep account is ready. Sign in to manage your handouts."}
          </div>
          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%", padding: "12px",
              background: C.accent, color: "#fff",
              border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: "24px 16px",
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: "36px 36px 32px", width: "100%", maxWidth: 420,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: C.accent, margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#fff",
          }}>H</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Handout Pay</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Create your account</div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: "flex",
          background: "#0f0f0f", borderRadius: 10,
          border: `1px solid ${C.border}`,
          padding: 4, marginBottom: 24,
        }}>
          {["student", "rep"].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1, padding: "8px 0",
                borderRadius: 7, border: "none",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.18s",
                background: tab === t ? C.accent : "transparent",
                color:      tab === t ? "#fff"   : C.muted,
              }}
            >
              {t === "student" ? "Student" : "Course Rep"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#2d1414", border: `1px solid ${C.error}`,
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: C.error, marginBottom: 16,
          }}>{error}</div>
        )}

        {/* Fields */}
        <Field
          label="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Kwame Mensah"
        />
        <Field
          label="Student ID"
          value={form.student_id}
          onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          placeholder="e.g. STU/2024/001"
        />
        <Field
          label="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="e.g. 0241234567"
          hint="Ghana number — 10 digits starting with 0"
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Min. 8 characters"
        />
        <Field
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Re-enter your password"
        />

        {tab === "rep" && (
          <Field
            label="Invite Code"
            value={repForm.invite_code}
            onChange={(e) => setRepForm({ ...repForm, invite_code: e.target.value })}
            placeholder="Provided by admin"
            hint="Contact your department admin for this code"
          />
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "12px",
            background: C.accent, color: "#fff",
            border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
            marginTop: 4,
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: C.accent, fontWeight: 600, cursor: "pointer" }}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}