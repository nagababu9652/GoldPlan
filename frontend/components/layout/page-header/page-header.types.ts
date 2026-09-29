import { HTMLAttributes } from "react";

export type PageHeaderProps = HTMLAttributes<HTMLDivElement>;
export interface BreadcrumbItem {
  label: string;
  href?: string;
}