import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "../../utils/chartColors";

const VIEWS = [
  { key: "mostPlayed", label: "Most Played" },
  { key: "uploads", label: "Uploads Over Time" },
  { key: "mostLiked", label: "Most Liked" },
];

function SongsPanel({ songAnalytics, loading, error }) {
  const colors = useChartColors();
  const [view, setView] = useState("mostPlayed");

  const chartTooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg">Songs</h2>
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

      {songAnalytics && !loading && view === "mostPlayed" && (
        songAnalytics.mostPlayed.length === 0 ? (
          <p className="text-sm text-muted">No plays yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={songAnalytics.mostPlayed} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
              <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12, fill: colors.text }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="playCount" fill={colors.primary} name="Plays" />
            </BarChart>
          </ResponsiveContainer>
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
        songAnalytics.mostLiked.length === 0 ? (
          <p className="text-sm text-muted">No likes yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={songAnalytics.mostLiked} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
              <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12, fill: colors.text }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="likesCount" fill={colors.accent} name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        )
      )}
    </div>
  );
}

export default SongsPanel;
