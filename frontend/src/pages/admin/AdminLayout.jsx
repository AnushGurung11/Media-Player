import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/upload", label: "Upload Track" },
  { to: "/admin/tracks", label: "Manage Tracks" },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const { handleLogout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "16px" }}>
        <h3>Admin Panel</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{ fontWeight: location.pathname === to ? "bold" : "normal" }}
            >
              {location.pathname === to ? "→ " : ""}{label}
            </Link>
          ))}
        </nav>
        <hr />
        <Link to="/">← Back to Player</Link>
        <br /><br />
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "24px" }}>
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;