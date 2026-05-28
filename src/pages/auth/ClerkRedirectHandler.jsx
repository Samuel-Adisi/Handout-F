import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../../api/axios";

export default function ClerkRedirectHandler() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    async function syncWithDjango() {
      try {
        const token = await getToken();
        const { data } = await api.post(
          "/accounts/clerk-auth/",
          {
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            clerk_id: user.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify({
          role: data.role,
          name: data.name,
          id: data.id,
        }));

        if (data.role === "rep")     navigate("/rep/dashboard");
        if (data.role === "student") navigate("/student/handouts");
        if (data.role === "admin")   navigate("/rep/dashboard");
      } catch (err) {
        console.error("Django sync failed:", err);
        navigate("/login");
      }
    }

    syncWithDjango();
  }, [isLoaded, isSignedIn]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(255,255,255,0.2)",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#9CA3AF" }}>Signing you in...</p>
      </div>
    </div>
  );
}