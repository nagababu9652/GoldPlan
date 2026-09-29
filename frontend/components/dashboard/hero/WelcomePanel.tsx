"use client";

import type { AdvisorDashboard } from "@/lib/api";

interface Props {
  advisor?: AdvisorDashboard | null;
}

export default function WelcomePanel({
  advisor: advisorData,
}: Props) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const firstName =
    advisorData?.advisor_name?.split(" ")[0] || "Advisor";

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <section className="relative rounded-none border border-line bg-obsidian p-7 lg:p-10 text-bone">
      {/* Decorative rings - more subtle */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-bone/5" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-bone/5" />

      {/* Subtle accent line */}
      <div className="absolute left-0 top-0 h-full w-1 bg-antique" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="label-mono mb-4 text-bone/50 tracking-widest">
            Advisor Workspace
          </div>

          <h1 className="display max-w-3xl text-[38px] leading-[1.05] lg:text-[48px] xl:text-[56px] text-bone">
            {greeting},{" "}
            <em className="text-antique">
              {firstName}
            </em>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-bone/80">
            Your client relationships, portfolios,
            reviews and financial activity — all in
            one place.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2 rounded-full bg-emerald-500">
              <span className="absolute inset-0 h-full w-full rounded-full bg-emerald-500 animate-ping opacity-75" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-bone/45">
              Active Session
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-bone/45">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-bone/20" />
              {today}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}