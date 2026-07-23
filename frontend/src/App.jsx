import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { PlayerProvider } from "./context/PlayerContext";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";

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
  if (!isAdmin) return <ForbiddenPage />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={
        <PrivateRoute><Layout><HomePage /></Layout></PrivateRoute>
      } />

      <Route path="/discover" element={
        <PrivateRoute><Layout><DiscoverPage /></Layout></PrivateRoute>
      } />

      <Route path="/upload" element={
        <PrivateRoute><Layout><UserUpload /></Layout></PrivateRoute>
      } />

      <Route path="/playlists" element={
        <PrivateRoute><Layout><PlaylistsPage /></Layout></PrivateRoute>
      } />

      <Route path="/admin/upload" element={
        <AdminRoute><AdminUpload /></AdminRoute>
      } />

      <Route path="/admin/tracks" element={
        <AdminRoute><AdminTracks /></AdminRoute>
      } />

      <Route path="/admin/dashboard" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <PlayerProvider>
            <AppRoutes />
          </PlayerProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;