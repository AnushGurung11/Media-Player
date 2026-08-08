import Sidebar from "./Sidebar";
import Player from "./Player";
import ThemeToggle from "./ThemeToggle";
import Brand from "./Brand";
import BottomNav from "./BottomNav";

function Layout({ children }) {
  return (
    <div className="bg-ink text-text min-h-screen">
      {/* Mobile top bar — slim: brand + theme toggle, nav lives in the bottom bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-surface border-b border-border px-4 py-2.5">
        <Brand className="text-lg" />
        <ThemeToggle />
      </div>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-5 md:p-10 pb-44 md:pb-28">{children}</main>
      </div>

      <Player />
      <BottomNav />
    </div>
  );
}

export default Layout;
