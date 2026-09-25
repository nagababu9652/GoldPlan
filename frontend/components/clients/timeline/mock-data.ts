import { TimelineEvent } from "./types";

export const timelineEvents: TimelineEvent[] = [
  {
    id: "TL001",
    title: "Portfolio Review Meeting",
    description: "Quarterly review completed. Recommended SIP increase.",
    type: "Meeting",
    user: "Anita Verma",
    createdAt: "2026-07-28 11:00",
    important: true,
  },
  {
    id: "TL002",
    title: "PAN Uploaded",
    description: "Client uploaded PAN document.",
    type: "Document",
    user: "Rahul Sharma",
    createdAt: "2026-07-26 09:20",
    important: false,
  },
  {
    id: "TL003",
    title: "SIP Executed",
    description: "₹5,000 SIP processed successfully.",
    type: "Transaction",
    user: "System",
    createdAt: "2026-07-25 08:00",
    important: false,
  },
];