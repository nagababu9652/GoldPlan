import { Meeting } from "./meeting.types";

export async function getMeetings(): Promise<Meeting[]> {
  const res = await fetch("/api/meetings");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch meetings: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Meeting[]>;
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`/api/meetings/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete meeting: ${res.status} ${res.statusText}`
    );
  }
}