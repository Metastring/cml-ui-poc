export function BiodiversitySearchBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute -left-8 top-16 h-32 w-32 text-primary/8
          rotate-[-18deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <svg
        className="absolute right-8 top-8 h-24 w-24 text-accent/20
          rotate-[12deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <svg
        className="absolute bottom-12 left-1/4 h-20 w-20 text-primary/6
          rotate-[8deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <svg
        className="absolute -right-4 bottom-20 h-28 w-28 text-accent/12
          rotate-[-25deg]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4C20 18 8 28 8 42c0 12 10 18 24 18s24-6 24-18C56 28 44 18 32 4z" />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
