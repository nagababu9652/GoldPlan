"use client";

import { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";

interface PageContainerProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}

export default function PageContainer({
  title,
  description,
  actions,
  filters,
  children,
}: PageContainerProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-3xl text-sm text-ash">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}

      </div>

      {/* Filters */}
      {filters && (
        <div className="mb-6">
          {filters}
        </div>
      )}

      {/* Main Content */}
      <section className="space-y-6">
        {children}
      </section>

    </div>
  );
}