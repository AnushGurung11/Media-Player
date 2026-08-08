import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../../components/ThemeToggle";
import Brand from "../../components/Brand";
import { LayoutDashboard, Upload, Music, House, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/upload", label: "Upload Track", Icon: Upload },
  { to: "/admin/tracks", label: "Manage Tracks", Icon: Music },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (to) => location.pathname === to;

  const navLink = (item, extra = "") =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${extra} ${
      isActive(item.to)
        ? "bg-surface-2 text-text font-semibold"
        : "text-muted hover:text-text hover:bg-surface-2"
    }`;

  return (
    <div className="min-h-screen bg-ink text-text flex flex-col md:flex-row">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-surface border-r border-border sticky top-0 h-screen">
        <div className="px-5 py-5 flex items-center justify-between">
          <Brand className="text-xl" />
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-1 px-3 text-xs uppercase tracking-wide text-muted">
            Management
          </div>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={navLink({ to })}>
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
          <div className="pt-4 pb-1 px-3 text-xs uppercase tracking-wide text-muted">
            Site
          </div>
          <Link to="/" className={navLink({ to: "/" })}>
            <House size={18} strokeWidth={1.75} className="shrink-0" />
            <span>Back to Player</span>
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn-ghost w-full"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2">
            <Brand className="text-lg" />
            <span className="text-xs font-medium text-muted align-middle">
              Admin
            </span>
          </span>
          <ThemeToggle />
        </div>
        <nav className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={navLink({ to })}>
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
          <Link to="/" className={navLink({ to: "/" })}>
            <House size={18} strokeWidth={1.75} className="shrink-0" />
            <span>Player</span>
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-text whitespace-nowrap"
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span>Logout</span>
          </button>
        </nav>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>

      {/* ── Logout confirm ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="card max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base mb-2">Log out of VIBE?</h3>
            <p className="text-sm text-muted mb-5">
              You'll need to log in again to keep listening.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                  navigate("/login");
                }}
                className="btn-danger"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
