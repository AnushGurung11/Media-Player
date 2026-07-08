import AdminLayout from "./AdminLayout";
import { useAdminTracks } from "../../hooks/useAdminTracks";

function AdminTracks() {
  const { tracks, loading, error, deletingId, handleDelete } = useAdminTracks();

  return (
    <AdminLayout>
      <h1>Manage Tracks</h1>
      <p style={{ color: "gray" }}>
        View and remove tracks from the library.
      </p>

      <hr />

      {loading && <p>Loading tracks...</p>}

      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <p>No tracks uploaded yet.</p>
      )}

      {!loading && tracks.length > 0 && (
        <table border="1" cellPadding="8" cellSpacing="0"
               style={{ width: "100%", borderCollapse: "collapse" }}>
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
            {tracks.map((track) => (
              <tr key={track._id}>
                <td>
                  {track.coverUrl
                    ? <img src={track.coverUrl} alt={track.title}
                           style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                    : "—"}
                </td>
                <td>{track.title}</td>
                <td>{track.artist}</td>
                <td>{track.album || "—"}</td>
                <td>{track.genre || "—"}</td>
                <td>{track.license}</td>
                <td>{track.playCount}</td>
                <td>{new Date(track.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDelete(track)}
                    disabled={deletingId === track._id}
                    style={{ color: "red" }}
                  >
                    {deletingId === track._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

export default AdminTracks;