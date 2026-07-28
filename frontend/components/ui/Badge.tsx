import * as React from "react";

const badgeVariants = {
  default: "bg-bone-deep text-ash-light border border-line",
  primary: "bg-obsidian text-bone",
  outline: "border border-obsidian/20 text-obsidian bg-transparent",
  accent: "bg-antique-subtle text-antique-dark border border-antique/20",
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${badgeVariants[variant]} ${className ?? ""}`}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };