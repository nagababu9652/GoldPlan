export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  pan: string;
  aum: number;
  status: "active" | "inactive";
  photo?: string;
  branch?: string;
  rm?: string;
  createdAt?: string;
  updatedAt?: string;
}