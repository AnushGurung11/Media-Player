import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminUpload from "./pages/admin/AdminUpload";
import UserUpload from "./pages/UserUpload";
import PlaylistsPage from "./pages/PlaylistsPage";
// TODO: this file doesn't exist yet as far as I've seen — the "Manage Tracks"
// button on HomePage links to /admin/tracks, but there's no component built for it.
// Create it (a table of tracks with edit/delete actions) and drop it at this path,
// or tell me and I'll scaffold a starting version.
import AdminTracks from "./pages/admin/AdminTracks";
import 

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// FIX: this didn't exist before — nothing was checking role for /admin/* paths.
// Any logged-in user hitting these URLs would previously get bounced by the
// catch-all wildcard (since the routes didn't exist at all), but even once
// routes existed, PrivateRoute alone only checks for a token, not admin role.
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />

        {/* FIX: these two routes were completely missing, so any path under
            /admin/* fell through to the wildcard route below and got redirected
            to "/" instantly — which is why the buttons looked like they "did nothing". */}
        <Route path="/admin/upload" element={
          <AdminRoute>
            <AdminUpload />
          </AdminRoute>
        } />

        <Route path="/admin/tracks" element={
          <AdminRoute>
            <AdminTracks />
          </AdminRoute>
        } />

        <Route path="/upload" element={
          <PrivateRoute><UserUpload /></PrivateRoute>
        } />
        <Route path="/playlists" element={
          <PrivateRoute><PlaylistsPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;