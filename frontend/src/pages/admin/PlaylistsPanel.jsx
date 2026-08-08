import { useState } from "react";
import Pagination from "../../components/Pagination";
import { Search } from "lucide-react";

const PAGE_SIZE = 8;

function PlaylistsPanel({ playlists, loading, error }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-lg">Playlists</h2>
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${playlists.length} total playlists`}
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
                {pageRows.map((p) => (
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
