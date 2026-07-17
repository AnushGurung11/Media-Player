import Sidebar from "./Sidebar";
import Player from "./Player";

function Layout({ children }) {
  return (
    <div className="flex bg-ink text-text min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-28">
        {children}
      </main>
      <Player />
    </div>
  );
}

export default Layout;