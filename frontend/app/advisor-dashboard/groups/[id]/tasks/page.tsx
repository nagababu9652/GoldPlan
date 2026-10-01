import TaskTable from "@/components/task/list/TaskTable";

export default async function GroupTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="space-y-4"><div className="dashboard-panel p-6"><h1 className="font-serif text-3xl">Household Tasks</h1><p className="mt-2 text-sm text-ash">Follow-ups and work assigned to this group.</p></div><TaskTable customerGroupId={Number(id)} /></div>;
}
