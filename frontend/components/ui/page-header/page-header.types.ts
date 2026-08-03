import { HTMLAttributes } from "react";

export interface PageHeaderProps
  extends HTMLAttributes<HTMLDivElement> {}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}