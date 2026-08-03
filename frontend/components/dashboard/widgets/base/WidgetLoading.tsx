"use client";

export default function WidgetLoading() {
  return (
    <div className="animate-pulse p-6">

      <div className="mb-6 h-6 w-40 rounded bg-muted" />

      <div className="space-y-3">

        <div className="h-4 rounded bg-muted" />

        <div className="h-4 rounded bg-muted" />

        <div className="h-4 w-2/3 rounded bg-muted" />

      </div>

    </div>
  );
}