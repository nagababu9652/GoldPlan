import ClientPortfolio from "@/components/clients/portfolio/ClientPortfolio";
import { getPortfolio } from "@/components/clients/portfolio/portfolio-api";

export default async function PortfolioPage() {
  const holdings = await getPortfolio();

  return (
    <ClientPortfolio
      holdings={holdings}
    />
  );
}