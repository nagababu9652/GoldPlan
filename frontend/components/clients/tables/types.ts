export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PROSPECT"
  | "BLOCKED";

export type RiskProfile =
  | "Low"
  | "Moderate"
  | "High";

export interface Client {
  id: string;

  name: string;

  email: string;

  phone: string;

  advisor: string;

  aum: number;

  status: ClientStatus;

  risk: RiskProfile;

  avatar?: string;
}

export interface ClientFilters {
  search: string;

  advisor: string;

  status: ClientStatus | "all";

  risk: RiskProfile | "all";
}