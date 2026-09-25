export type TimelineEventType =
  | "Meeting"
  | "Call"
  | "Email"
  | "Transaction"
  | "Document"
  | "Goal"
  | "Portfolio"
  | "Note"
  | "Risk Profile"
  | "System";

export interface TimelineEvent {
  id: string;

  title: string;

  description: string;

  type: TimelineEventType;

  user: string;

  createdAt: string;

  important: boolean;
}