import { Report } from "./report.types";

export async function getReports(): Promise<Report[]> {
  const res = await fetch("/api/reports");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch reports: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Report[]>;
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`/api/reports/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete report: ${res.status} ${res.statusText}`
    );
  }
}