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
    <section className="grid items-start gap-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
      <div className="min-h-0">
        <WelcomePanel advisor={advisor} />
      </div>

      <div className="min-h-0">
        <AdvisorSnapshot advisor={advisor} />
      </div>
    </section>
  );
}