import { MessageTable } from "@/components/messages/list/index";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Communication
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Messages
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Manage client and group communication records.
        </p>
      </div>

      <MessageTable />
    </div>
  );
}