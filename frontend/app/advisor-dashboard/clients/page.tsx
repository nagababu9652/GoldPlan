import { ClientTable } from "@/components/clients/list";

export default function ClientsPage() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Clients
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage all clients, portfolios, and relationships.
        </p>

      </div>

      <ClientTable />

    </div>
  );
}