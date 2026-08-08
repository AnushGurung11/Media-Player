import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "../../utils/chartColors";
import api from "../../services/api";
import { Play, Heart, Trash2 } from "lucide-react";

const VIEWS = [
  { key: "mostPlayed", label: "Most Played" },
  { key: "uploads", label: "Uploads Over Time" },
  { key: "mostLiked", label: "Most Liked" },
];

function SongList({ songs, formatValue, Icon, deletingId, onDelete }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
      {songs.length === 0 ? (
        <li className="px-4 py-6 text-center text-sm text-muted">
          No songs to show.
        </li>
      ) : (
        songs.map((song, i) => (
          <li key={song._id} className="flex items-center gap-3 px-3 py-2.5">
            <span className="w-5 text-xs text-muted tabular-nums shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{song.title}</p>
              <p className="text-xs text-muted truncate">{song.artist}</p>
            </div>
            <span className="text-xs text-muted flex items-center gap-1.5 shrink-0 tabular-nums">
              {Icon}
              {formatValue(song)}
            </span>
            <button
              onClick={() => onDelete(song)}
              disabled={deletingId === song._id}
              className="btn-danger !px-2 !py-1.5 text-xs"
              aria-label={`Delete ${song.title}`}
            >
              {deletingId === song._id ? (
                "…"
              ) : (
                <Trash2 size={13} />
              )}
            </button>
          </li>
        ))
      )}
    </ul>
  );
}

function SongsPanel({ songAnalytics, loading, error }) {
  const colors = useChartColors();
  const [view, setView] = useState("mostPlayed");
  const [removedIds, setRemovedIds] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const chartTooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
  };

  const mostPlayed = (songAnalytics?.mostPlayed ?? []).filter(
    (s) => !removedIds[s._id],
  );
  const mostLiked = (songAnalytics?.mostLiked ?? []).filter(
    (s) => !removedIds[s._id],
  );

  const handleDelete = async (song) => {
    if (
      !window.confirm(
        `Delete "${song.title}" by ${song.artist}? This removes the track and its files and can't be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(song._id);
    setDeleteError("");
    try {
      await api.delete(`/tracks/${song._id}`);
      setRemovedIds((prev) => ({ ...prev, [song._id]: true }));
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete track.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-lg">Songs</h2>
          <p className="text-sm text-muted">
            Top 10 analytics with quick delete
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {VIEWS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={view === key ? "btn-primary !px-3 !py-1.5 text-xs" : "btn-outline !px-3 !py-1.5 text-xs"}
              aria-pressed={view === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-muted">Loading chart…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {deleteError && (
        <p className="text-sm text-danger mb-3">{deleteError}</p>
      )}

      {songAnalytics && !loading && view === "mostPlayed" && (
        mostPlayed.length === 0 ? (
          <p className="text-sm text-muted">No plays yet.</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mostPlayed} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
                <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12, fill: colors.text }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="playCount" fill={colors.primary} name="Plays" />
              </BarChart>
            </ResponsiveContainer>
            <SongList
              songs={mostPlayed}
              formatValue={(s) => s.playCount}
              Icon={<Play size={13} />}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          </div>
        )
      )}

      {songAnalytics && !loading && view === "uploads" && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={songAnalytics.uploadsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: colors.text }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="count" stroke={colors.warning} strokeWidth={2} name="Uploads" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {songAnalytics && !loading && view === "mostLiked" && (
        mostLiked.length === 0 ? (
          <p className="text-sm text-muted">No likes yet.</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mostLiked} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
                <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12, fill: colors.text }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="likesCount" fill={colors.accent} name="Likes" />
              </BarChart>
            </ResponsiveContainer>
            <SongList
              songs={mostLiked}
              formatValue={(s) => s.likesCount}
              Icon={<Heart size={13} />}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          </div>
        )
      )}
    </div>
  );
}

export default SongsPanel;
