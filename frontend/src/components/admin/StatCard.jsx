function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-blood-dim/30 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-2xl font-display font-bold leading-tight tabular-nums">
          {value}
        </p>
        {sub && <p className="text-xs text-muted truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default StatCard;
