import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import AdminRoute from "./routes/AdminRoute";

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <PlayerProvider>
            <AppRoutes />
          </PlayerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;