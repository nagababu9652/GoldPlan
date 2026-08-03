import { Notification } from "./notification.types";

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch notifications: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Notification[]>;
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete notification: ${res.status} ${res.statusText}`
    );
  }
}