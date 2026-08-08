import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/discover", label: "Discover", icon: "🔍" },
  { to: "/playlists", label: "Playlists", icon: "📋" },
  { to: "/upload", label: "Upload", icon: "＋" },
];

function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border"
      aria-label="Primary"
    >
      <div className="flex justify-around items-stretch max-w-lg mx-auto">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors ${
                isActive
                  ? "text-text font-semibold"
                  : "text-muted hover:text-text"
              }`
            }
          >
            <span className="text-[22px] leading-none">{item.icon}</span>
            <span className="text-[10px] leading-none">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
