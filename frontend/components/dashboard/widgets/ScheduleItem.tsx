"use client";

import { Calendar, Clock } from "lucide-react";

interface ScheduleItemProps {
  title: string;
  client: string;
  time: string;
  type: "Meeting" | "Review" | "Task";
  status?: "Upcoming" | "Completed" | "Pending";
}

export default function ScheduleItem({
  title,
  client,
  time,
  type,
  status = "Upcoming",
}: ScheduleItemProps) {
  const statusColor = {
    Upcoming: "text-blue-700 border-blue-200 bg-blue-50",
    Completed: "text-emerald-700 border-emerald-200 bg-emerald-50",
    Pending: "text-amber-700 border-amber-200 bg-amber-50",
  };

  return (
    <div className="flex items-start justify-between rounded-xl border border-line bg-bone p-4 hover:bg-bone-deep transition-colors">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span className="font-medium">{title}</span>
        </div>

        <p className="text-sm text-ash">{client}</p>

        <div className="flex items-center gap-2 text-xs text-ash">
          <Clock size={14} />
          {time}
        </div>
      </div>

      <div className="text-right space-y-2">
        <span className="block text-xs font-mono border border-line px-2 py-1 rounded">
          {type}
        </span>

        <span
          className={`block rounded px-2 py-1 text-xs border ${
            statusColor[status]
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}