"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: StatCardProps) {
  return (
    <section className="group rounded-2xl border border-line bg-bone p-5 transition-colors duration-200 hover:bg-bone-deep lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-mono text-ash">
            {title}
          </p>

          <h3 className="mt-4 truncate font-serif text-[28px] leading-none tracking-tight text-obsidian lg:text-[30px]">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-2 text-xs leading-5 text-ash">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ash transition-colors duration-200 group-hover:border-obsidian/20 group-hover:text-obsidian">
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-5 border-t border-line pt-3">
          <span
            className={`text-[11px] font-mono ${
              trend >= 0
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% this month
          </span>
        </div>
      )}
    </section>
  );
}