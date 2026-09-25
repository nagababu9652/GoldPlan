export type DocumentCategory =
  | "KYC"
  | "Investment"
  | "Insurance"
  | "Tax"
  | "Report"
  | "Agreement"
  | "Other";

export type DocumentStatus =
  | "Verified"
  | "Pending"
  | "Expired";

export interface ClientDocument {
  id: string;

  name: string;

  category: DocumentCategory;

  fileType: "PDF" | "DOCX" | "XLSX" | "PNG" | "JPG";

  size: string;

  uploadedOn: string;

  uploadedBy: string;

  status: DocumentStatus;

  expiryDate?: string;
}