import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";

const VIEWS = [
  { key: "mostPlayed", label: "Most Played" },
  { key: "uploads",    label: "Uploads Over Time" },
  { key: "mostLiked",  label: "Most Liked" },
];

function SongsPanel() {
  const [view, setView] = useState("mostPlayed");
  const { songAnalytics, loading, error } = useAdminAnalytics();

  return (
    <div>
      <h2>Songs</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: view === key ? "2px solid #333" : "1px solid #ccc",
              backgroundColor: view === key ? "#333" : "white",
              color: view === key ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p>Loading chart...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {songAnalytics && view === "mostPlayed" && (
        songAnalytics.mostPlayed.length === 0 ? <p>No plays yet.</p> : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={songAnalytics.mostPlayed} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="playCount" fill="#4f46e5" name="Plays" />
            </BarChart>
          </ResponsiveContainer>
        )
      )}

      {songAnalytics && view === "uploads" && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={songAnalytics.uploadsByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} name="Uploads" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {songAnalytics && view === "mostLiked" && (
        songAnalytics.mostLiked.length === 0 ? <p>No likes yet.</p> : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={songAnalytics.mostLiked} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="likesCount" fill="#e11d48" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        )
      )}
    </div>
  );
}

export default SongsPanel;