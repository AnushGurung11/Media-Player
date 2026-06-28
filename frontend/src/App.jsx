import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Protects routes — redirects to /login if no token
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public — no Layout (clean focused auth experience) */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — wrapped in Layout (header + footer) */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <div className="max-w-7xl mx-auto px-6 py-12
                              text-[#F0EEFF] font-['Syne'] text-2xl">
                🎵 Home page — coming next!
              </div>
            </Layout>
          </PrivateRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;