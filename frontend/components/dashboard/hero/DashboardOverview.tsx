import type { AdvisorDashboard } from "@/lib/api";

import WelcomePanel from "./WelcomePanel";
import AdvisorSnapshot from "./AdvisorSnapshot";

interface Props {
  advisor: AdvisorDashboard;
}

export default function DashboardOverview({
  advisor,
}: Props) {
  return (
    <section className="grid items-start gap-6 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <WelcomePanel advisor={advisor} />

      <AdvisorSnapshot advisor={advisor} />
    </section>
  );
}