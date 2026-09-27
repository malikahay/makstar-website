export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 0l2.6 8.4H24l-7.6 5.4 2.9 8.9L12 17.3l-7.3 5.4 2.9-8.9L0 8.4h9.4z"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-start font-display font-black tracking-tight leading-none ${className}`}>
      MAKSTAR
      <Star className="ml-[0.08em] h-[0.45em] w-[0.45em] text-mk-yellow" />
    </span>
  );
}
