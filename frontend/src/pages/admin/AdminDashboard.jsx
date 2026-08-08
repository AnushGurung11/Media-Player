import { useState } from "react";
import AdminLayout from "./AdminLayout";
import StatCard from "../../components/admin/StatCard";
import UsersPanel from "./UsersPanel";
import SongsPanel from "./SongsPanel";
import PlaylistsPanel from "./PlaylistsPanel";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useAdminPlaylists } from "../../hooks/useAdminPlaylists";
import { useAdminTracks } from "../../hooks/useAdminTracks";
import { Users, Music, ListMusic, Zap, Play, Heart } from "lucide-react";

const TABS = [
  { key: "users", label: "Users", Icon: Users, Component: UsersPanel },
  { key: "songs", label: "Songs", Icon: Music, Component: SongsPanel },
  { key: "playlists", label: "Playlists", Icon: ListMusic, Component: PlaylistsPanel },
];

function AdminDashboard() {
  const [tab, setTab] = useState("users");

  const {
    users,
    loading: usersLoading,
    error: usersError,
    deletingId,
    handleDelete,
  } = useAdminUsers();
  const { playlists, loading: playlistsLoading, error: playlistsError } =
    useAdminPlaylists();
  const {
    tracks,
    loading: tracksLoading,
    error: tracksError,
  } = useAdminTracks();
  const {
    userAnalytics,
    songAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAdminAnalytics();

  const activeCount = users.filter((u) => u.isActive).length;
  const totalPlays = (songAnalytics?.mostPlayed ?? []).reduce(
    (sum, s) => sum + (s.playCount || 0),
    0,
  );
  const totalLikes = (songAnalytics?.mostLiked ?? []).reduce(
    (sum, s) => sum + (s.likesCount || 0),
    0,
  );

  const ActivePanel = TABS.find((t) => t.key === tab).Component;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl">Admin Dashboard</h1>
          <p className="text-sm text-muted">
            Overview of users, content, and engagement.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            icon={<Users size={22} strokeWidth={1.75} />}
            label="Total Users"
            value={usersLoading ? "…" : users.length}
            sub={`${activeCount} active now`}
          />
          <StatCard
            icon={<Zap size={22} strokeWidth={1.75} />}
            label="Active Now"
            value={usersLoading ? "…" : activeCount}
            sub="online users"
          />
          <StatCard
            icon={<Music size={22} strokeWidth={1.75} />}
            label="Tracks"
            value={tracksLoading ? "…" : tracks.length}
            sub="in library"
          />
          <StatCard
            icon={<ListMusic size={22} strokeWidth={1.75} />}
            label="Playlists"
            value={playlistsLoading ? "…" : playlists.length}
            sub="total created"
          />
          <StatCard
            icon={<Play size={22} strokeWidth={1.75} />}
            label="Plays"
            value={analyticsLoading ? "…" : totalPlays}
            sub="top-10 tracks"
          />
          <StatCard
            icon={<Heart size={22} strokeWidth={1.75} />}
            label="Likes"
            value={analyticsLoading ? "…" : totalLikes}
            sub="top-10 tracks"
          />
        </div>

        {(usersError || tracksError || playlistsError || analyticsError) && (
          <div className="rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
            <strong>Error:</strong>{" "}
            {usersError || tracksError || playlistsError || analyticsError}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={tab === key ? "btn-primary" : "btn-outline"}
              aria-pressed={tab === key}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        <ActivePanel
          users={users}
          usersLoading={usersLoading}
          usersError={usersError}
          deletingId={deletingId}
          handleDelete={handleDelete}
          playlists={playlists}
          playlistsLoading={playlistsLoading}
          playlistsError={playlistsError}
          userAnalytics={userAnalytics}
          songAnalytics={songAnalytics}
          analyticsLoading={analyticsLoading}
          analyticsError={analyticsError}
        />
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
