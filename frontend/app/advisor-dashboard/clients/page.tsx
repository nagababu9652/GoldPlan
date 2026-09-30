import { ClientTable } from "@/components/clients/list";

export default function ClientsPage() {
  return (
    <div className="space-y-3">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Client operations
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Clients
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Manage all clients, portfolios, and relationships from one workspace.
        </p>
      </div>

      <ClientTable />
    </div>
  );
}