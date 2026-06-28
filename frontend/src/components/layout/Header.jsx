import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-900/20
                       bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 no-underline">
          <span className="text-2xl text-violet-400">♪</span>
          <span className="font-['Syne'] text-xl font-extrabold
                           text-[#F0EEFF] tracking-tight">
            Vibe
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {[
            { to: "/",          label: "Home"      },
            { to: "/search",    label: "Search"    },
            { to: "/playlists", label: "Playlists" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-1.5 rounded-full text-sm font-medium
                         text-[#6B6B8A] hover:text-white
                         hover:bg-violet-900/20 transition-all duration-200
                         no-underline"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {token ? (
            <button className="btn-ghost text-sm" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;