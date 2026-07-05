import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/admin/overview",  label: "Overview",  icon: "▦" },
  { to: "/admin/users",     label: "Users",      icon: "◎" },
  { to: "/admin/manage",    label: "Manage",     icon: "+" },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">

      {/* Sidebar */}
      <aside className="w-60 border-r border-violet-900/20 bg-[#0D0D14]
                        flex flex-col flex-shrink-0">

        {/* Brand */}
        <div className="h-16 flex items-center gap-2 px-6
                        border-b border-violet-900/20">
          <span className="text-2xl text-violet-400">♪</span>
          <span className="font-['Syne'] text-xl font-extrabold text-[#F0EEFF]">
            Vibe
          </span>
          <span className="ml-1 text-[10px] font-bold bg-violet-600/30
                           text-violet-300 px-1.5 py-0.5 rounded
                           border border-violet-500/30">
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl
                            text-sm font-medium no-underline
                            transition-all duration-200
                            ${isActive
                              ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                              : "text-[#6B6B8A] hover:text-white hover:bg-violet-900/20"}`}
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-violet-900/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5
                       rounded-xl text-sm font-medium text-[#6B6B8A]
                       hover:text-rose-400 hover:bg-rose-500/10
                       transition-all duration-200"
          >
            <span className="text-base w-5 text-center">⏻</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;