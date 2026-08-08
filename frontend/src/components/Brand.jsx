function Brand({ className = "text-xl" }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span className="bg-gradient-to-r from-brand-a to-brand-b bg-clip-text text-transparent">
        VIBE.
      </span>
    </span>
  );
}

export default Brand;
