"use client";

import { useParams } from "next/navigation";
import { MessageForm } from "@/components/messages/form/index";

export default function EditMessagePage() {
  const params = useParams();

  const id = Number(params.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Message</h1>
        <p className="mt-2 text-muted-foreground">
          Update the message details.
        </p>
      </div>

      <MessageForm messageId={id} />
    </div>
  );
}