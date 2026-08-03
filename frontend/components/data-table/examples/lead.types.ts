export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: "website" | "referral" | "social" | "campaign" | "walk-in";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  assignedTo: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}