"use client";

import { useParams } from "next/navigation";
import { MessageForm } from "@/components/messages/form/index";

export default function EditMessagePage() {
  const params = useParams();

  const id = Number(params.id);

  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Message update
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Edit Message
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Update the message details.
        </p>
      </div>

      <MessageForm messageId={id} />
    </div>
  );
}