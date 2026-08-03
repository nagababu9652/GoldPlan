export interface Audit {
  id: string;
  action: string;
  module: string;
  userId: string;
  userName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
  createdAt?: string;
}