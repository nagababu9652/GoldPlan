export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}