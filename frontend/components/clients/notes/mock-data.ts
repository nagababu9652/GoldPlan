import { ClientNote } from "./types";

export const notes: ClientNote[] = [
  {
    id: "NOTE001",
    title: "Quarterly Review",
    content:
      "Client is satisfied with portfolio performance. Increase SIP by ₹5,000 from next month.",
    author: "Anita Verma",
    createdAt: "2026-07-20 10:30",
    pinned: true,
    tags: ["Review", "SIP"],
  },
  {
    id: "NOTE002",
    title: "Insurance Discussion",
    content:
      "Discussed term insurance requirements. Follow up after salary revision.",
    author: "Anita Verma",
    createdAt: "2026-07-27 15:10",
    pinned: false,
    tags: ["Insurance"],
  },
];