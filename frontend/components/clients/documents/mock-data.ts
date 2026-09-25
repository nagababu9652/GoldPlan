import { ClientDocument } from "./types";

export const documents: ClientDocument[] = [
  {
    id: "DOC001",
    name: "PAN Card",
    category: "KYC",
    fileType: "PDF",
    size: "1.2 MB",
    uploadedOn: "2026-06-20",
    uploadedBy: "Advisor",
    status: "Verified",
  },
  {
    id: "DOC002",
    name: "Aadhaar Card",
    category: "KYC",
    fileType: "PDF",
    size: "2.1 MB",
    uploadedOn: "2026-06-22",
    uploadedBy: "Client",
    status: "Verified",
  },
  {
    id: "DOC003",
    name: "Portfolio Report Q2",
    category: "Report",
    fileType: "PDF",
    size: "3.5 MB",
    uploadedOn: "2026-07-10",
    uploadedBy: "Advisor",
    status: "Pending",
  },
];