"use client";

export function Card({
  children,
  className = "",
  padding = true,
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        rounded-[var(--radius-lg)] border border-[var(--card-border)]
        bg-[var(--card)] shadow-[var(--shadow)]
        transition-all duration-300
        ${hover ? "hover:shadow-[var(--shadow-lg)] hover:border-[var(--card-border)]" : ""}
        ${padding ? "p-6 sm:p-8" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
