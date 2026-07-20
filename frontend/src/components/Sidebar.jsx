import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/discover", label: "Discover", icon: "🔍" },
  { to: "/playlists", label: "Playlists", icon: "📋" },
  { to: "/upload", label: "Upload", icon: "＋" },
];

function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, isAdmin, handleLogout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      collapsed ? "md:justify-center" : ""
    } ${
      location.pathname === path
        ? "bg-blood-dim/30 text-red-300"
        : "text-muted hover:text-text hover:bg-surface-2"
    }`;

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onMobileClose();
    handleLogout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`bg-surface border-r border-border flex flex-col transition-transform
                    duration-200 z-50 fixed md:sticky top-0 left-0 h-screen
                    w-64 ${collapsed ? "md:w-16" : "md:w-60"}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          {!collapsed && (
            <span className="text-xl font-display font-bold tracking-tight">
              VIBE<span className="text-blood">.</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block text-muted hover:text-text transition-colors text-lg"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
          <button
            onClick={onMobileClose}
            className="md:hidden text-muted hover:text-text transition-colors text-xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={linkClass(item.to)}
              title={collapsed ? item.label : undefined}
            >
              <span>{item.icon}</span>
              <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className={`pt-4 pb-1 px-3 text-xs uppercase tracking-wide text-muted ${collapsed ? "md:hidden" : ""}`}>
                Admin
              </div>
              <Link to="/admin/dashboard" onClick={onMobileClose} className={linkClass("/admin/dashboard")} title={collapsed ? "Dashboard" : undefined}>
                <span>⚙</span>
                <span className={collapsed ? "md:hidden" : ""}>Dashboard</span>
              </Link>
              <Link to="/admin/tracks" onClick={onMobileClose} className={linkClass("/admin/tracks")} title={collapsed ? "Manage Tracks" : undefined}>
                <span>🎵</span>
                <span className={collapsed ? "md:hidden" : ""}>Manage Tracks</span>
              </Link>
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <div className={`px-3 mb-2 text-sm ${collapsed ? "md:hidden" : ""}`}>
            <div className="font-medium truncate">{user.username}</div>
            {isAdmin && <span className="badge">{user.role}</span>}
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`btn-ghost w-full ${collapsed ? "md:!px-0" : ""}`}
            title={collapsed ? "Logout" : undefined}
          >
            <span className={collapsed ? "md:hidden" : ""}>Logout</span>
            <span className={collapsed ? "hidden md:inline" : "hidden"}>⎋</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="card max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base mb-2">Log out of VIBE?</h3>
            <p className="text-sm text-muted mb-5">You'll need to log in again to keep listening.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost">Cancel</button>
              <button onClick={confirmLogout} className="btn-danger">Log out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Sidebar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  onMobileClose: PropTypes.func.isRequired,
};

export default Sidebar;