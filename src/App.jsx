import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import api from "./api/axios";
import Login           from "./pages/auth/Login";
import Register        from "./pages/auth/Register";
import RepDashboard    from "./pages/rep/Dashboard";
import RepCourses      from "./pages/rep/Courses";
import RepHandouts     from "./pages/rep/Handouts";
import RepPayments     from "./pages/rep/Payments";
import StudentHandouts from "./pages/student/Handouts";
import StudentPayments from "./pages/student/MyPayments";
import ClerkRedirectHandler from "./pages/auth/ClerkRedirectHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  },
});

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user?.id) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  useEffect(() => {
    api.get("/accounts/ping/").catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/register/rep" element={<Register />} />
          <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback afterSignInUrl="/clerk-sync" afterSignUpUrl="/clerk-sync" />} />
          <Route path="/clerk-sync"   element={<ClerkRedirectHandler />} />
          <Route path="/rep/dashboard" element={<PrivateRoute role="rep"><RepDashboard /></PrivateRoute>} />
          <Route path="/rep/courses"   element={<PrivateRoute role="rep"><RepCourses /></PrivateRoute>} />
          <Route path="/rep/handouts"  element={<PrivateRoute role="rep"><RepHandouts /></PrivateRoute>} />
          <Route path="/rep/payments"  element={<PrivateRoute role="rep"><RepPayments /></PrivateRoute>} />
          <Route path="/student/handouts" element={<PrivateRoute role="student"><StudentHandouts /></PrivateRoute>} />
          <Route path="/student/payments" element={<PrivateRoute role="student"><StudentPayments /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}