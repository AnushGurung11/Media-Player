function buildPages(page, totalPages) {
  const candidates = [1, totalPages, page - 1, page, page + 1];
  const sorted = [...new Set(candidates)]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({ page, totalPages, pageSize, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navBtn =
    "btn-outline !px-3 !py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed";
  const pageBtn =
    "!px-3 !py-1.5 text-xs";

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-5">
      <p className="text-xs text-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={navBtn}
        >
          « Prev
        </button>
        {buildPages(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? `btn-primary ${pageBtn}`
                  : `btn-outline ${pageBtn}`
              }
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={navBtn}
        >
          Next »
        </button>
      </div>
    </div>
  );
}

export default Pagination;
