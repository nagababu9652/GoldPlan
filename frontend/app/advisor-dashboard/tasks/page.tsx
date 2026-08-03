"use client";

import { useEffect, useState } from "react";

import TaskTable from "./TaskTable";

import { getTasks } from "./task.service";

export default function TasksPage() {

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getTasks().then((data) => {

      setTasks(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <TaskTable tasks={tasks} />;

}