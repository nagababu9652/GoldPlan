export interface Report {
  id: string;
  name: string;
  type: "aum" | "transaction" | "commission" | "client" | "performance" | "compliance";
  format: "pdf" | "excel" | "csv";
  generatedBy: string;
  dateRange: string;
  status: "generated" | "pending" | "failed";
  fileSize: number;
  createdAt?: string;
  updatedAt?: string;
}