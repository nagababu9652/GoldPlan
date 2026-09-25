export type ClientStatus =
  | "Active"
  | "Inactive"
  | "Prospect";

export type RiskProfile =
  | "Conservative"
  | "Moderate"
  | "Aggressive";

export interface Client {
  id: string;

  firstName: string;

  lastName: string;

  fullName: string;

  email: string;

  phone: string;

  pan: string;

  advisor: string;

  riskProfile: RiskProfile;

  status: ClientStatus;

  aum: number;

  goals: number;

  sipCount: number;

  lastReview: string;

  createdAt: string;
}