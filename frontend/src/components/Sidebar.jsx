// frontend/src/components/Sidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/discover", label: "Discover", icon: "🔍" },
  { to: "/playlists", label: "Playlists", icon: "📋" },
  { to: "/upload", label: "Upload", icon: "＋" },
];

function Sidebar() {
  const { user, isAdmin, handleLogout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      collapsed ? "justify-center" : ""
    } ${
      location.pathname === path
        ? "bg-blood-dim/30 text-red-300"
        : "text-muted hover:text-text hover:bg-surface-2"
    }`;

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  return (
    <>
      <aside
        className={`shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex flex-col transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          {!collapsed && (
            <span className="text-xl font-display font-bold tracking-tight">
              VIBE<span className="text-blood">.</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted hover:text-text transition-colors text-lg"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass(item.to)} title={collapsed ? item.label : undefined}>
              <span>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              {!collapsed && (
                <div className="pt-4 pb-1 px-3 text-xs uppercase tracking-wide text-muted">Admin</div>
              )}
              <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")} title={collapsed ? "Dashboard" : undefined}>
                <span>⚙</span>
                {!collapsed && "Dashboard"}
              </Link>
              <Link to="/admin/tracks" className={linkClass("/admin/tracks")} title={collapsed ? "Manage Tracks" : undefined}>
                <span>🎵</span>
                {!collapsed && "Manage Tracks"}
              </Link>
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          {!collapsed && (
            <div className="px-3 mb-2 text-sm">
              <div className="font-medium truncate">{user.username}</div>
              {isAdmin && <span className="badge">{user.role}</span>}
            </div>
          )}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={collapsed ? "btn-ghost w-full !px-0" : "btn-ghost w-full"}
            title={collapsed ? "Logout" : undefined}
          >
            {collapsed ? "⎋" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="card max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base mb-2">Log out of VIBE?</h3>
            <p className="text-sm text-muted mb-5">
              You'll need to log in again to keep listening.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost">
                Cancel
              </button>
              <button onClick={confirmLogout} className="btn-danger">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;