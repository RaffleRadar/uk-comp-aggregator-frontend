import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "icon" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-rr-green text-rr-on-accent border border-transparent hover:opacity-90",
  secondary:
    "bg-transparent border border-rr-border text-rr-secondary hover:bg-rr-elevated",
  icon: "bg-rr-elevated border border-rr-border text-rr-secondary hover:opacity-90 h-9 w-9 p-0 inline-flex items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent border border-transparent text-rr-secondary hover:bg-rr-elevated",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}