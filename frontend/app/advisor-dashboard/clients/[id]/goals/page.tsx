import ClientGoals from "@/components/clients/goals/ClientGoals";
import { getGoals } from "@/components/clients/goals/api";

export default async function GoalsPage() {
  const goals = await getGoals();

  return <ClientGoals goals={goals} />;
}