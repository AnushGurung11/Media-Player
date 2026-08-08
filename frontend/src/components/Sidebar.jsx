import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import Brand from "./Brand";
import {
  House,
  Search,
  ListMusic,
  Upload,
  LayoutDashboard,
  Music,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: House },
  { to: "/discover", label: "Discover", Icon: Search },
  { to: "/playlists", label: "Playlists", Icon: ListMusic },
  { to: "/upload", label: "Upload", Icon: Upload },
];

const ADMIN_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/tracks", label: "Manage Tracks", Icon: Music },
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
        ? "bg-surface-2 text-text font-semibold"
        : "text-muted hover:text-text hover:bg-surface-2"
    }`;

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  return (
    <aside
      className={`hidden md:flex bg-surface border-r border-border flex-col transition-all
                  duration-200 sticky top-0 h-screen
                  ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="px-5 py-5 flex items-center justify-between">
        {!collapsed && <Brand className="text-xl" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted hover:text-text transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={linkClass(to)}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className={`pt-4 pb-1 px-3 text-xs uppercase tracking-wide text-muted ${collapsed ? "sr-only" : ""}`}>
              Admin
            </div>
            {ADMIN_ITEMS.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={linkClass(to)}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} strokeWidth={1.75} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className={`px-3 mb-2 text-sm ${collapsed ? "sr-only" : ""}`}>
          <div className="font-medium truncate">{user.username}</div>
          {isAdmin && <span className="badge">{user.role}</span>}
        </div>
        <div className="flex items-center gap-2 px-1">
          <ThemeToggle />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`btn-ghost flex-1 ${collapsed ? "!px-0" : ""}`}
            title={collapsed ? "Logout" : undefined}
          >
            {!collapsed && <span>Logout</span>}
            {collapsed && <LogOut size={16} />}
          </button>
        </div>
      </div>

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
    </aside>
  );
}

export default Sidebar;
