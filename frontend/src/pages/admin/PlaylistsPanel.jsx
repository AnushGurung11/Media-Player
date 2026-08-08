function PlaylistsPanel({ playlists, loading, error }) {
  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-lg">Playlists</h2>
        <p className="text-sm text-muted">
          {loading ? "Loading…" : `${playlists.length} total playlists`}
        </p>
      </div>

      {loading && <p className="text-sm text-muted">Loading playlists…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && !error && playlists.length === 0 && (
        <p className="text-sm text-muted">No playlists created yet.</p>
      )}

      {!loading && playlists.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-vibe min-w-[640px]">
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
                  <td className="font-medium">{p.name}</td>
                  <td className="text-muted">{p.owner}</td>
                  <td className="text-muted">{p.songCount}</td>
                  <td>
                    <span className={`text-xs font-medium ${p.shuffle ? "text-success" : "text-muted"}`}>
                      {p.shuffle ? "On" : "Off"}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PlaylistsPanel;
