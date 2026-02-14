"use client";

/**
 * Card container with optional padding and subtle border/shadow.
 */
export function Card({ children, className = "", padding = true, ...props }) {
  return (
    <div
      className={`
        rounded-[var(--radius)] border border-[var(--card-border)]
        bg-[var(--card)] shadow-[var(--shadow)]
        transition box-shadow var(--transition)
        hover:shadow-[var(--shadow-lg)]
        ${padding ? "p-6 sm:p-8" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
