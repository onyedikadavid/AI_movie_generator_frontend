"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-tally text-ink font-semibold hover:bg-tally/90 disabled:bg-tally/40",
  secondary: "bg-ink-raised text-paper border border-ink-border hover:bg-ink-border disabled:opacity-40",
  ghost: "bg-transparent text-paper-muted hover:text-paper hover:bg-ink-raised disabled:opacity-40",
  danger: "bg-transparent text-cut border border-cut/40 hover:bg-cut/10 disabled:opacity-40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
