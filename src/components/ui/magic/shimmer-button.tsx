import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ShimmerButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export default function ShimmerButton({ children, className, ...props }: ShimmerButtonProps) {
  const classes = ["magic-shimmer-button", className].filter(Boolean).join(" ");

  return (
    <a {...props} className={classes}>
      <span className="magic-shimmer-sheen" aria-hidden="true"></span>
      <span className="magic-shimmer-content">{children}</span>
    </a>
  );
}
