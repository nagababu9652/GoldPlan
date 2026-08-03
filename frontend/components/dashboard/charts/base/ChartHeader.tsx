"use client";

interface Props {
  title?: string;

  subtitle?: string;
}

export default function ChartHeader({
  title,
  subtitle,
}: Props) {
  if (!title) return null;

  return (
    <div className="mb-6">

      <h3 className="text-lg font-semibold">

        {title}

      </h3>

      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">

          {subtitle}

        </p>
      )}

    </div>
  );
}