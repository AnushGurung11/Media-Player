/**
 * Polished segmented control with a sliding indicator pill.
 *
 * Props:
 *  - options: [{ value, label, Icon? }]
 *  - value: selected option value
 *  - onChange(value)
 *  - className: extra classes for the track (width, etc.)
 */
function SegmentedControl({ options, value, onChange, className = "" }) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  return (
    <div
      role="radiogroup"
      className={`relative grid p-1 bg-surface-2 border border-border rounded-full ${className}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {/* Sliding indicator — width = track minus the p-1 padding, divided equally */}
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-full bg-btn-primary-bg shadow-sm transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(calc(${index} * 100%))`,
        }}
      />

      {options.map(({ value: optValue, label, Icon }) => {
        const selected = optValue === value;
        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optValue)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20 ${
              selected ? "text-btn-primary-fg" : "text-muted hover:text-text"
            }`}
          >
            {Icon && <Icon size={15} strokeWidth={selected ? 2.25 : 1.75} />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
