import ClientDocuments from "@/components/clients/documents/ClientDocuments";
import { getDocuments } from "@/components/clients/documents/api";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <ClientDocuments
      documents={documents}
    />
  );
}