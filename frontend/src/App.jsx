import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import HomePage      from "./pages/HomePage";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers    from "./pages/admin/AdminUsers";
import AdminManage   from "./pages/admin/AdminManage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token)                return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/"      replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={
          <PrivateRoute><HomePage /></PrivateRoute>
        } />

        {/* Admin routes — each wrapped individually so sidebar nav works */}
        <Route path="/admin/overview" element={
          <AdminRoute><AdminOverview /></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><AdminUsers /></AdminRoute>
        } />
        <Route path="/admin/manage" element={
          <AdminRoute><AdminManage /></AdminRoute>
        } />

        {/* Default admin redirect */}
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;