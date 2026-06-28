import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import HomePage       from "./pages/HomePage";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Redirects to /login if no token
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Redirects to /login if not admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token)              return <Navigate to="/login"  replace />;
  if (user.role !== "admin") return <Navigate to="/"    replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User protected route */}
        <Route path="/" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />

        {/* Admin protected route */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;