import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { PlayerProvider } from "./context/PlayerContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminUpload from "./pages/admin/AdminUpload";
import UserUpload from "./pages/UserUpload";
import PlaylistsPage from "./pages/PlaylistsPage";
import AdminTracks from "./pages/admin/AdminTracks";
import DiscoverPage from "./pages/DiscoverPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/discover"
        element={
          <PrivateRoute>
            <DiscoverPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/upload"
        element={
          <AdminRoute>
            <AdminUpload />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/tracks"
        element={
          <AdminRoute>
            <AdminTracks />
          </AdminRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <UserUpload />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/playlists"
        element={
          <PrivateRoute>
            <PlaylistsPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
