import { getAccountHoldings, getClientFinancialAccounts } from "@/lib/api";
import { Holding } from "./portfolio-types";

export async function getPortfolio(token: string, clientId: number): Promise<Holding[]> {
  const accounts = (await getClientFinancialAccounts(token, clientId)).accounts;
  const responses = await Promise.all(accounts.map((account) => getAccountHoldings(token, account.id)));
  return responses.flatMap((response) => response.holdings.map((holding) => ({
    id: String(holding.id), fundName: holding.security_name,
    category: holding.security_type.replace(/_/g, " "),
    folioNumber: holding.folio_number ?? holding.symbol ?? "—",
    units: Number(holding.quantity), nav: Number(holding.current_price),
    currentValue: Number(holding.current_value), investedValue: Number(holding.invested_value),
    gain: Number(holding.gain), gainPercent: Number(holding.gain_percentage),
  })));
}
