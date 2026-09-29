import DocumentTable from "@/components/documents/llist/DocumentTable";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Documents
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Document Center
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Manage uploaded files, client records, and advisory documents.
        </p>
      </div>

      <DocumentTable />
    </div>
  );
}