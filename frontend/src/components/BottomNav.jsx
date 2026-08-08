import { NavLink } from "react-router-dom";
import { House, Search, ListMusic, Upload } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", Icon: House },
  { to: "/discover", label: "Discover", Icon: Search },
  { to: "/playlists", label: "Playlists", Icon: ListMusic },
  { to: "/upload", label: "Upload", Icon: Upload },
];

function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border"
      aria-label="Primary"
    >
      <div className="flex justify-around items-stretch max-w-lg mx-auto">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-2.5 transition-colors ${
                isActive
                  ? "text-text font-semibold"
                  : "text-muted hover:text-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[10px] leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
