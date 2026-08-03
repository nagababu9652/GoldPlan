export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}