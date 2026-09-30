import PortfolioSummary from "./PortfolioSummary";
import HoldingsTable from "./HoldingsTable";
import { Holding } from "./portfolio-types";

interface Props {
  holdings: Holding[];
}

export default function ClientPortfolio({
  holdings,
}: Props) {
  const invested = holdings.reduce(
    (sum, item) => sum + item.investedValue,
    0
  );

  const current = holdings.reduce(
    (sum, item) => sum + item.currentValue,
    0
  );

  return (
    <div className="space-y-3">

      <PortfolioSummary
        invested={invested}
        current={current}
      />

      <HoldingsTable holdings={holdings} />

    </div>
  );
}