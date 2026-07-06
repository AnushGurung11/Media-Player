// NEW FILE — you flagged that anyone logged-in could type /admin/upload into the
// URL bar directly. This wraps admin pages and bounces non-admins back to home.
//
// Usage in your router (wherever you currently render <AdminUpload /> / <AdminLayout />):
//
//   <Route path="/admin/upload" element={
//     <AdminRoute><AdminUpload /></AdminRoute>
//   } />
//   <Route path="/admin/tracks" element={
//     <AdminRoute><AdminTracks /></AdminRoute>
//   } />

import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;