export type GuideContextKey =
  | "clientId"
  | "groupId"
  | "meetingId"
  | "taskId"
  | "documentId";

export interface GuideContext {
  pathname: string;
  area: "client" | "group" | "meeting" | "task" | "document" | "advisor" | "public";
  clientId?: string;
  groupId?: string;
  meetingId?: string;
  taskId?: string;
  documentId?: string;
}

export interface GuideAction {
  label: string;
  route: string;
  requires?: GuideContextKey[];
}

export interface GuideKnowledgeEntry {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  actions?: GuideAction[];
  contextAreas?: GuideContext["area"][];
  suggestions?: string[];
}

export interface GuideReply {
  answer: string;
  actions: Array<{ label: string; route: string }>;
  suggestions: string[];
  matchedEntryId?: string;
  confidence: number;
}
