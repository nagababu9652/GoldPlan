export interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  revenue: number;
  employees: number;
  status: "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  createdAt?: string;
  updatedAt?: string;
}