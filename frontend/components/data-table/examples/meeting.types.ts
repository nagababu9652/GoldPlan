export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  location: string;
  type: "in-person" | "video" | "phone";
  attendees: string[];
  relatedTo?: {
    type: "lead" | "customer" | "prospect" | "policy";
    id: string;
  };
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  createdAt?: string;
  updatedAt?: string;
}