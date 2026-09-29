import { TaskForm } from "@/components/task/form";

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Task creation
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          New Task
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Create a follow-up or advisor task.
        </p>
      </div>

      <TaskForm />
    </div>
  );
}