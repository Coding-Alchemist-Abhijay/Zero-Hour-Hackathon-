"use client";

/**
 * CivicBridge primary button with smooth transitions and variants.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-[var(--radius)] btn-transition disabled:opacity-60 disabled:pointer-events-none disabled:transform-none select-none";
  const variants = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] border border-transparent",
    secondary:
      "bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary-light)]",
    ghost:
      "bg-transparent text-[var(--foreground)] hover:bg-[var(--muted-bg)] border border-transparent",
    accent:
      "bg-[var(--accent)] text-white border border-transparent hover:opacity-90",
  };
  const sizes = {
    sm: "h-9 px-4 text-sm gap-1.5",
    md: "h-11 px-6 text-base gap-2",
    lg: "h-12 px-8 text-lg gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
