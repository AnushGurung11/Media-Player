import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminUpload from "./pages/admin/AdminUpload";
import UserUpload from "./pages/UserUpload";
import PlaylistsPage from "./pages/PlaylistsPage";
import AdminTracks from "./pages/admin/AdminTracks";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

// Small inner component so useAuth/usePlayer can be called
// (they need to be inside the providers, which wrap this).
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={
        <PrivateRoute><HomePage /></PrivateRoute>
      } />

      <Route path="/admin/upload" element={
        <AdminRoute><AdminUpload /></AdminRoute>
      } />

      <Route path="/admin/tracks" element={
        <AdminRoute><AdminTracks /></AdminRoute>
      } />

      <Route path="/upload" element={
        <PrivateRoute><UserUpload /></PrivateRoute>
      } />

      <Route path="/playlists" element={
        <PrivateRoute><PlaylistsPage /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider needs to be inside BrowserRouter because it calls useNavigate */}
      <AuthProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;