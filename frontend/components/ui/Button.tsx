import * as React from "react";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
};

const buttonVariants: Record<ButtonVariant, string> = {
  default: "bg-obsidian text-bone border border-obsidian hover:bg-antique hover:text-obsidian hover:border-antique shadow-sm",
  secondary: "bg-obsidian-soft text-bone border border-obsidian-soft hover:bg-obsidian-muted",
  outline: "bg-transparent text-obsidian border border-obsidian hover:bg-bone-deep shadow-sm",
  ghost: "bg-transparent text-obsidian border border-transparent hover:bg-bone-deep",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

const Button = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", href, children, onClick, type = "button", disabled, ...rest }, ref) => {
    const baseClasses = `inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 shadow-[0_1px_2px_0_rgba(12,11,10,0.04)] ${buttonVariants[variant]} ${buttonSizes[size]} ${className ?? ""}`;
    if (href) {
      return <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={baseClasses} {...rest}>{children}</a>;
    }
    return <button ref={ref as React.Ref<HTMLButtonElement>} type={type} disabled={disabled} onClick={onClick} className={baseClasses} {...rest}>{children}</button>;
  }
);
Button.displayName = "Button";

export { Button };
