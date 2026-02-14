"use client";

/**
 * Text input with label, error, and focus glow.
 */
export function Input({
  label,
  name,
  type = "text",
  error,
  placeholder,
  className = "",
  ...props
}) {
  const id = props.id ?? name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full h-11 px-4 rounded-[var(--radius-sm)] border bg-[var(--card)]
          text-[var(--foreground)] placeholder:text-[var(--muted)]
          border-[var(--card-border)] input-glow
          transition box-shadow var(--transition), border-color var(--transition)
          focus:border-[var(--primary)]
          ${error ? "border-[var(--error)] focus:border-[var(--error)]" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
