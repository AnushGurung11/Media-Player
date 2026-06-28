import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-violet-900/20 bg-[#12121A] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6
                      flex flex-wrap items-center justify-between gap-4">

        {/* Brand */}
        <div>
          <p className="font-['Syne'] font-extrabold text-lg text-[#F0EEFF]">
            ♪ Vibe
          </p>
          <p className="text-xs text-[#6B6B8A] mt-0.5">Music that moves you.</p>
        </div>

        {/* Links */}
        <div className="flex gap-6">
          {[
            { to: "/",          label: "Home"      },
            { to: "/search",    label: "Search"    },
            { to: "/playlists", label: "Playlists" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm text-[#6B6B8A] hover:text-violet-400
                         transition-colors duration-200 no-underline"
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-[#6B6B8A]">© 2026 Vibe. Built with MERN.</p>
      </div>
    </footer>
  );
}

export default Footer;