import { TaskTable } from "@/components/task/list";

export default function TasksPage() {
  return (
    <div className="space-y-3">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Task management
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Tasks
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Manage follow-ups, reminders, and advisor tasks.
        </p>
      </div>

      <TaskTable />
    </div>
  );
}