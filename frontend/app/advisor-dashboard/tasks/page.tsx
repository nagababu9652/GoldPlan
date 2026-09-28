import { TaskTable } from "@/components/task/list";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>

        <p className="mt-2 text-muted-foreground">
          Manage follow-ups, reminders, and advisor tasks.
        </p>
      </div>

      <TaskTable />
    </div>
  );
}