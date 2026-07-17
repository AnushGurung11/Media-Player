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

  const linkClass = (path) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-blood-dim/30 text-red-300"
        : "text-muted hover:text-text hover:bg-surface-2"
    }`;

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex flex-col">
      <div className="px-5 py-5">
        <span className="text-xl font-display font-extrabold tracking-tight">
          VIBE<span className="text-blood">.</span>
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className={linkClass(item.to)}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3 text-xs uppercase tracking-wide text-muted">Admin</div>
            <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")}>
              ⚙ Dashboard
            </Link>
            <Link to="/admin/tracks" className={linkClass("/admin/tracks")}>
              🎵 Manage Tracks
            </Link>
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 mb-2 text-sm">
          <div className="font-medium truncate">{user.username}</div>
          <span className="badge">{user.role}</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full">Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;