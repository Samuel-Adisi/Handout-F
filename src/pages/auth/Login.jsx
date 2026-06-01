import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTop: "2px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
      marginRight: 8,
      verticalAlign: "middle",
    }} />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ student_id: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

   async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/accounts/login/", form);
      localStorage.setItem("access",  data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify({
        role: data.role,
        name: data.name,
        id:   data.id,
      }));
      if (data.role === "rep")     navigate("/rep/dashboard");
      if (data.role === "student") navigate("/student/handouts");
      if (data.role === "admin")   navigate("/rep/dashboard");
  } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setError("Invalid student ID or password.");
      } else if (status === 404) {
        setError("Account not found. Check your student ID.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "0",
      }}>
        <div style={{
          background: C.surface,
          width: "100%",
          maxWidth: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            width: "100%",
            maxWidth: 420,
            padding: "40px 24px",
          }}>
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: C.accent, margin: "0 auto 14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 700, color: "#fff",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}>H</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Handout Pay</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Sign in to your account</div>
            </div>
             <form onSubmit={handleSubmit}> 
            {error && (
              <div style={{
                background: "#2d1414", border: `1px solid ${C.error}`,
                borderRadius: 10, padding: "12px 16px",
                fontSize: 13, color: C.error, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
               
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, color: C.muted,
                display: "block", marginBottom: 8, letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                Student ID
              </label>
              <input
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                placeholder="e.g. STU/2024/001"
                autoComplete="username"
                style={{
                  width: "100%", padding: "13px 16px",
                  background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 10, fontSize: 15, color: C.text,
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, color: C.muted,
                display: "block", marginBottom: 8, letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%", padding: "13px 16px",
                  background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 10, fontSize: 15, color: C.text,
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>

              <button
              type="submit"
               disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "#4a4db5" : C.accent,
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
                boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              {loading && <Spinner />}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            </form>
              <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.muted }}>

              Course rep?{" "}
              <span
                onClick={() => navigate("/register/rep")}
                style={{ color: C.accent, fontWeight: 600, cursor: "pointer" }}
              >
                Register here
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}