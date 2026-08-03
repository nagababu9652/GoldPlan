"use client";

import { Inbox } from "lucide-react";

interface Props {
  title?: string;

  description?: string;
}

export default function WidgetEmpty({
  title = "No Data",
  description = "Nothing to display.",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">

      <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />

      <h4 className="font-semibold">
        {title}
      </h4>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>

    </div>
  );
}