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
    advisorData?.advisor_name?.split(" ")[0] || "Chinni";

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
    <section className="relative min-h-[250px] overflow-hidden rounded-2xl bg-obsidian p-7 text-bone lg:p-8">
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-bone/10" />

      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-bone/10" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="label-mono mb-3 text-bone/50">
            ADVISOR WORKSPACE
          </div>

          <h1 className="display max-w-3xl text-[38px] leading-[1.05] lg:text-[46px]">
            {greeting},{" "}
            <em className="text-bone">
              {firstName}
            </em>
          </h1>

          <p className="mt-4 max-w-xl text-[14px] leading-6 text-bone/60">
            Your client relationships, portfolios,
            reviews and financial activity — all in
            one place.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-bone/10 pt-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-bone/45">
            Financial Advisor
          </span>

          <span className="text-[11px] font-mono uppercase tracking-wider text-bone/45">
            {today}
          </span>
        </div>
      </div>
    </section>
  );
}