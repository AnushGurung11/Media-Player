import { Link } from "react-router-dom";
import { useItunesSearch } from "../hooks/useItunesSearch";
import { usePlayer } from "../hooks/usePlayer";
import Player from "../components/Player";

function DiscoverPage() {
  const { query, setQuery, results, loading, error } = useItunesSearch();
  const { queue, currentIndex, loadQueueSource, handlePlay } = usePlayer();

  // Swap the active queue to the current search results, then play.
  const playResult = (track) => {
    loadQueueSource(results);
    // handlePlay looks up the track by _id inside the queue — but the
    // queue state update from loadQueueSource hasn't landed yet on this
    // render, so we call handlePlay against `results` directly instead.
    const index = results.findIndex((t) => t._id === track._id);
    if (index !== -1) handlePlay(results[index]);
  };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Discover</h1>
        <Link to="/"><button>← Back to Library</button></Link>
      </div>

      <p style={{ color: "gray" }}>
        Search iTunes for any song. Playback is a 30-second preview clip only —
        full tracks aren't available through this API.
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song, artist, or album..."
        style={{ width: "100%", padding: "10px", fontSize: "1em", marginBottom: "16px" }}
      />

      {loading && <p>Searching...</p>}

      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && query.trim() && results.length === 0 && (
        <p>No results for "{query}".</p>
      )}

      {results.length > 0 && (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Genre</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((track) => (
              <tr
                key={track._id}
                style={{
                  backgroundColor:
                    queue[currentIndex]?._id === track._id ? "#d0e8ff" : "white",
                }}
              >
                <td>
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                  ) : ("—")}
                </td>
                <td>{track.title}</td>
                <td>{track.artist}</td>
                <td>{track.album || "—"}</td>
                <td>{track.genre || "—"}</td>
                <td>
                  <button onClick={() => playResult(track)}>
                    {queue[currentIndex]?._id === track._id ? "▶ Playing" : "▶ Preview"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Player />
    </div>
  );
}

export default DiscoverPage;