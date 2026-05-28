import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
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
  const { signIn, isLoaded } = useSignIn();
  const [form, setForm]       = useState({ student_id: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
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
      setError("Invalid student ID or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/student/handouts",
      });
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
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
        .google-btn:hover {
          background: #2a2a2a !important;
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

            {/* Google Sign In Button */}
            <button
              className="google-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              style={{
                width: "100%", padding: "13px",
                background: C.bg,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 15, fontWeight: 500,
                cursor: googleLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10,
                marginBottom: 20,
                transition: "background 0.2s",
              }}
            >
              {googleLoading ? <Spinner /> : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              )}
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
            }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.muted }}>or sign in with Student ID</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Student ID */}
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
              onClick={handleSubmit}
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