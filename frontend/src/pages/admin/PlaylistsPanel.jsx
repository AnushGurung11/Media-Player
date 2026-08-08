import { useState } from "react";
import Pagination from "../../components/Pagination";
import { Search, ChevronDown, ChevronRight, Music } from "lucide-react";

const PAGE_SIZE = 8;

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function PlaylistsPanel({ playlists, loading, error }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? playlists.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q),
      )
    : playlists;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-lg">Playlists</h2>
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${playlists.length} total playlists`} — click a
            playlist to view its songs
          </p>
        </div>

        {!loading && playlists.length > 0 && (
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search by name or owner…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input !pl-9 !py-2 text-sm"
            />
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-muted">Loading playlists…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && !error && playlists.length === 0 && (
        <p className="text-sm text-muted">No playlists created yet.</p>
      )}

      {!loading && playlists.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted">No playlists match "{search.trim()}".</p>
      )}

      {!loading && filtered.length > 0 && (
        <>
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
                {pageRows.map((p) => {
                  const expanded = expandedId === p.id;
                  return [
                    <tr
                      key={p.id}
                      onClick={() => toggleExpand(p.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(p.id);
                        }
                      }}
                      className="cursor-pointer hover:bg-surface-2 transition-colors"
                      aria-expanded={expanded}
                    >
                      <td className="font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          {expanded ? (
                            <ChevronDown size={14} className="text-muted" />
                          ) : (
                            <ChevronRight size={14} className="text-muted" />
                          )}
                          {p.name}
                        </span>
                      </td>
                      <td className="text-muted">{p.owner}</td>
                      <td className="text-muted">{p.songCount}</td>
                      <td>
                        <span className={`text-xs font-medium ${p.shuffle ? "text-success" : "text-muted"}`}>
                          {p.shuffle ? "On" : "Off"}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>,
                    expanded && (
                      <tr key={`${p.id}-songs`}>
                        <td colSpan={5} className="!p-0">
                          <div className="bg-surface-2/60 border-t border-border rounded-b-xl overflow-hidden">
                            <div className="px-4 py-2 text-xs uppercase tracking-wide text-muted font-medium">
                              Songs ({p.songCount})
                            </div>
                            {p.songs.length === 0 ? (
                              <p className="px-4 pb-3 text-sm text-muted">
                                No songs in this playlist.
                              </p>
                            ) : (
                              <ul className="divide-y divide-border">
                                {p.songs.map((song, i) => (
                                  <li
                                    key={song.id}
                                    className="flex items-center gap-3 px-4 py-2 text-sm"
                                  >
                                    <span className="w-5 text-xs text-muted tabular-nums shrink-0">
                                      {i + 1}
                                    </span>
                                    <Music size={14} className="text-muted shrink-0" />
                                    <span className="font-medium truncate">{song.title}</span>
                                    <span className="text-muted truncate">{song.artist}</span>
                                    <span className="text-xs text-muted tabular-nums ml-auto shrink-0">
                                      {formatDuration(song.duration)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default PlaylistsPanel;
