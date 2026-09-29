"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  href?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  href,
}: StatCardProps) {
  const cardClassName = cn(
    "group block rounded-[24px] border border-line bg-white/60 p-5 shadow-[0_18px_40px_-30px_rgba(12,11,10,0.25)] backdrop-blur-sm lg:p-6",
    href ? "card-interactive" : "card-surface"
  );

  const content = (
    <>
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-obsidian/10 bg-obsidian text-bone shadow-inner shadow-white/10 transition-all duration-200 group-hover:scale-[1.04] group-hover:bg-antique group-hover:text-obsidian">
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-5 border-t border-line pt-3">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-mono ${
              trend >= 0
                ? "border-emerald-700/20 bg-emerald-500/10 text-emerald-700"
                : "border-red-600/20 bg-red-500/10 text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% this month
          </span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <section className={cardClassName}>
      {content}
    </section>
  );
}