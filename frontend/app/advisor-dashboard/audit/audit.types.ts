export interface Audit {
  id: string;
  action: string;
  entity: string;
  userId: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}