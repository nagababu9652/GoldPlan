export type NotificationStatus = "Unread" | "Read" | "Archived";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  status: NotificationStatus;
}
