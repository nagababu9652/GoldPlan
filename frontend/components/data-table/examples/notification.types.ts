export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  recipient: string;
  channel: "email" | "sms" | "push" | "in-app";
  status: "sent" | "failed" | "pending";
  sentAt?: string;
  createdAt?: string;
}