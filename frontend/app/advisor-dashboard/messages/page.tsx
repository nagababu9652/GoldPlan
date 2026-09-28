import { MessageTable } from "@/components/messages/list/index";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Manage client and group communication records.
        </p>
      </div>

      <MessageTable />
    </div>
  );
}