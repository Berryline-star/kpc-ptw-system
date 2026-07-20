import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Variants map directly to DESIGN.md "High-Contrast CTAs":
 * - primary: KPC Blue — default action
 * - secondary: Safety Orange — reserved for critical/hazard actions per DESIGN.md,
 *   but also used for the paired CTA button in marketing contexts (see landing page)
 * - outline: low-emphasis alternative action
 * - text: lowest emphasis, nav-style links
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  secondary: "bg-secondary text-on-secondary hover:opacity-90",
  outline:
    "border-2 border-outline-variant text-on-surface hover:bg-surface-container-low",
  text: "text-primary hover:text-primary-container px-stack-md",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "px-gutter py-3",
  lg: "px-8 py-4 md:px-10",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded font-label-lg text-label-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
