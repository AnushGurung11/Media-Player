function Brand({ className = "text-xl" }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      VIBE<span className="text-muted">.</span>
    </span>
  );
}

export default Brand;
