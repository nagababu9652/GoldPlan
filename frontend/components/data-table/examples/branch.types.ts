export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  manager: string;
  userCount: number;
  customerCount: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}