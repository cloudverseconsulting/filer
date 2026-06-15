import { type ButtonHTMLAttributes, type InputHTMLAttributes, forwardRef } from "react"

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...rest }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm"
    }
    const variants = {
      primary: "bg-accent hover:bg-accent-hover text-white",
      secondary:
        "bg-bg-card border border-border hover:bg-bg-secondary text-text-primary",
      ghost: "hover:bg-bg-secondary text-text-secondary hover:text-text-primary",
      danger:
        "bg-red-600 hover:bg-red-700 text-white"
    }
    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...rest}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

// Toggle
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label?: string
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        checked ? "bg-accent" : "bg-border"
      }`}>
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  )
}

// Badge
interface BadgeProps {
  children: React.ReactNode
  color?: "accent" | "success" | "warning" | "muted"
  className?: string
}

export function Badge({ children, color = "accent", className = "" }: BadgeProps) {
  const colors = {
    accent: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    muted: "bg-[color:var(--border)] text-[color:var(--text-secondary)]"
  }
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`rounded-md border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${
            error ? "border-red-500" : "border-border"
          } ${className}`}
          {...rest}
        />
        {hint && !error && (
          <p className="text-[11px] text-text-secondary">{hint}</p>
        )}
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = "", ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-text-secondary">{label}</label>
      )}
      <select
        className={`rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
        {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Modal wrapper
interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  title?: string
  wide?: boolean
}

export function Modal({ children, onClose, title, wide }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`bg-bg-primary border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] ${
          wide ? "w-full max-w-2xl" : "w-full max-w-lg"
        }`}>
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors text-xl leading-none">
              ×
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// Lock overlay for gated features
export function LockedOverlay({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-md z-10"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}>
      <button
        onClick={onUpgrade}
        className="flex flex-col items-center gap-1 text-center">
        <span className="text-2xl">🔒</span>
        <Badge color="warning">Pro</Badge>
      </button>
    </div>
  )
}
