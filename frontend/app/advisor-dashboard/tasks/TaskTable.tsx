"use client";

import DataTable from "@/components/data-table";

import {
taskColumns,
} from "./task.columns";

interface Props{

tasks:Task[];

}

export default function TaskTable({

tasks,

}:Props){

return(

<DataTable

columns={taskColumns}

data={tasks}

searchable

filterable

selectable

pagination

exportable

/>

);

}