export type ReportStatus = "Ready" | "Processing" | "Failed";

export interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  status: ReportStatus;
}
