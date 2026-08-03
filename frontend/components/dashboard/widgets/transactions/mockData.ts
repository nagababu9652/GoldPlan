import { Transaction } from "./types";

export const recentTransactions: Transaction[] = [
  {
    id: "TXN001",
    clientName: "Rahul Sharma",
    scheme: "HDFC Flexi Cap Fund",
    amount: 250000,
    type: "PURCHASE",
    status: "SUCCESS",
    date: "Today",
  },
  {
    id: "TXN002",
    clientName: "Anita Patel",
    scheme: "ICICI Bluechip Fund",
    amount: 50000,
    type: "SIP",
    status: "PENDING",
    date: "Today",
  },
  {
    id: "TXN003",
    clientName: "Ravi Kumar",
    scheme: "Parag Parikh Flexi Cap",
    amount: 120000,
    type: "REDEMPTION",
    status: "SUCCESS",
    date: "Yesterday",
  },
  {
    id: "TXN004",
    clientName: "Neha Gupta",
    scheme: "Axis ELSS",
    amount: 75000,
    type: "PURCHASE",
    status: "FAILED",
    date: "Yesterday",
  },
];