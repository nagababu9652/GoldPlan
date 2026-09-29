import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  as?: ElementType;
} & ComponentPropsWithoutRef<"main">;

export default function PageFrame({
  children,
  className,
  contentClassName,
  as: Tag = "main",
  ...props
}: PageFrameProps) {
  return (
    <Tag className={cn("min-h-screen bg-bone text-obsidian", className)} {...props}>
      <div className="page-frame grain">
        <section className={cn("shell-body", contentClassName)}>{children}</section>
      </div>
    </Tag>
  );
}
