import { useAdminPlaylists } from "../../hooks/useAdminPlaylists";

function PlaylistsPanel() {
  const { playlists, loading, error } = useAdminPlaylists();

  return (
    <div>
      <h2>Playlists</h2>
      <p style={{ color: "gray" }}>{playlists.length} total playlists</p>

      {loading && <p>Loading playlists...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && playlists.length === 0 && <p>No playlists created yet.</p>}

      {!loading && playlists.length > 0 && (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Songs</th>
              <th>Shuffle</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.owner}</td>
                <td>{p.songCount}</td>
                <td>{p.shuffle ? "On" : "Off"}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PlaylistsPanel;