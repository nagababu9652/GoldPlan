export type CommunicationMode =
  | "Email"
  | "SMS"
  | "WhatsApp";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  primary: boolean;
}

export interface Nominee {
  id: string;
  name: string;
  relationship: string;
  allocation: number;
}

export interface ClientSettings {
  riskProfile: "Conservative" | "Moderate" | "Aggressive";

  communicationMode: CommunicationMode;

  kycVerified: boolean;

  fatcaCompleted: boolean;

  bankAccounts: BankAccount[];

  nominees: Nominee[];
}