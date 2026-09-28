import { TaskForm } from "@/components/task/form";

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          New Task
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create a follow-up or advisor task.
        </p>
      </div>

      <TaskForm />
    </div>
  );
}