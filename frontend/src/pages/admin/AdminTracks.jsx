import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminTracks } from "../../hooks/useAdminTracks";
import { Music } from "lucide-react";

function AdminTracks() {
  const { tracks, loading, error, deletingId, handleDelete } = useAdminTracks();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? tracks.filter(
        (t) =>
          t.title?.toLowerCase().includes(query.toLowerCase()) ||
          t.artist?.toLowerCase().includes(query.toLowerCase()),
      )
    : tracks;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl">Manage Tracks</h1>
            <p className="text-sm text-muted">
              View and remove tracks from the library.
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or artist…"
            className="input !w-64"
            aria-label="Search tracks"
          />
        </div>

        {error && (
          <div className="rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && <p className="text-sm text-muted">Loading tracks…</p>}

        {!loading && !error && tracks.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-sm text-muted">No tracks uploaded yet.</p>
          </div>
        )}

        {!loading && tracks.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-muted">
            No tracks match "{query}".
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="table-vibe min-w-[760px]">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th>Genre</th>
                    <th>License</th>
                    <th>Plays</th>
                    <th>Uploaded</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((track) => (
                    <tr key={track._id}>
                      <td>
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center text-muted">
                            <Music size={18} strokeWidth={1.5} />
                          </div>
                        )}
                      </td>
                      <td className="font-medium">{track.title}</td>
                      <td className="text-muted">{track.artist}</td>
                      <td className="text-muted">{track.album || "—"}</td>
                      <td className="text-muted">{track.genre || "—"}</td>
                      <td>
                        <span className="badge">{track.license}</span>
                      </td>
                      <td className="text-muted tabular-nums">{track.playCount}</td>
                      <td className="text-muted">
                        {new Date(track.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(track)}
                          disabled={deletingId === track._id}
                          className="btn-danger !px-2.5 !py-1 text-xs"
                        >
                          {deletingId === track._id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminTracks;
