import { ClientSettings } from "./types";

export const clientSettings: ClientSettings = {
  riskProfile: "Moderate",

  communicationMode: "Email",

  kycVerified: true,

  fatcaCompleted: true,

  bankAccounts: [
    {
      id: "1",
      bankName: "HDFC Bank",
      accountNumber: "XXXXXX4582",
      ifsc: "HDFC0001234",
      primary: true,
    },
  ],

  nominees: [
    {
      id: "1",
      name: "Priya Sharma",
      relationship: "Spouse",
      allocation: 100,
    },
  ],
};