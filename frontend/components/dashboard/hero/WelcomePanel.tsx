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
    <section className="dashboard-panel relative h-full overflow-hidden bg-obsidian p-7 text-bone lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,180,122,0.14),transparent_32%),linear-gradient(135deg,rgba(12,11,10,1),rgba(26,24,22,0.96))]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-bone/10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full border border-antique/30" />
      <div className="absolute inset-y-0 left-0 w-1 bg-antique" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="dashboard-tag border-bone/20 bg-bone/5 text-bone/80">
              Advisor Workspace
            </span>
          </div>

          <h1 className="display max-w-3xl text-[38px] leading-[1.05] text-bone lg:text-[48px] xl:text-[56px]">
            {greeting},{" "}
            <em className="text-antique-light">
              {firstName}
            </em>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-bone/75">
            Your client relationships, portfolio performance,
            reviews and critical financial tasks — all in one place.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 rounded-full bg-emerald-400">
              <span className="absolute inset-0 h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-bone/55">
              Active Session
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-bone/55">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-bone/35" />
              {today}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}