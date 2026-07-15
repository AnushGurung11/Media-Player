import { useState } from "react";
import AdminLayout from "./AdminLayout";
import UsersPanel from "./UsersPanel";
import SongsPanel from "./SongsPanel";
import PlaylistsPanel from "./PlaylistsPanel";

const TABS = [
  { key: "users",     label: "Users",     Component: UsersPanel },
  { key: "songs",     label: "Songs",     Component: SongsPanel },
  { key: "playlists", label: "Playlists", Component: PlaylistsPanel },
];

function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const ActivePanel = TABS.find((t) => t.key === tab).Component;

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", borderBottom: "2px solid #ccc", marginBottom: "20px" }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: tab === key ? "3px solid #4f46e5" : "3px solid transparent",
              backgroundColor: "transparent",
              fontWeight: tab === key ? "bold" : "normal",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ActivePanel />
    </AdminLayout>
  );
}

export default AdminDashboard;