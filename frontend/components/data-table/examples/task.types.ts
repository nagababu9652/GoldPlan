export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  reminderAt?: string;
  relatedTo?: {
    type: "lead" | "customer" | "prospect" | "policy";
    id: string;
  };
  createdAt?: string;
  updatedAt?: string;
}