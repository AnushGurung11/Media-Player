import { useState } from "react";
import Sidebar from "./Sidebar";
import Player from "./Player";
import ThemeToggle from "./ThemeToggle";
import Brand from "./Brand";

function Layout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-ink text-text min-h-screen">
      {/* Mobile top bar — hidden on desktop, sidebar handles nav there */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-surface border-b border-border px-4 py-3">
        <Brand className="text-lg" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileNavOpen(true)}
            className="text-xl text-muted hover:text-text transition-colors"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="flex">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <main className="flex-1 min-w-0 p-5 md:p-10 pb-28">{children}</main>
      </div>

      <Player />
    </div>
  );
}

export default Layout;