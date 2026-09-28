import { MessageForm } from "@/components/messages/form/index";

export default function NewMessagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Message</h1>
        <p className="mt-2 text-muted-foreground">
          Create a message for a client or group.
        </p>
      </div>

      <MessageForm />
    </div>
  );
}