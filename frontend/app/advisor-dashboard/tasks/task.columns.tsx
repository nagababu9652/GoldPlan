import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    taskActions,
} from "./task.actions";

export const taskColumns: ColumnDef<Task>[] = [

{
    accessorKey:"title",

    header:"Title",
},

{
    accessorKey:"description",

    header:"Description",
},

{
    accessorKey:"assignedTo",

    header:"Assigned To",
},

{
    accessorKey:"dueDate",

    header:"Due Date",
},

{
    accessorKey:"priority",

    header:"Priority",
},

{
    accessorKey:"status",

    header:"Status",

    cell:({row})=>

    <StatusColumn
        value={row.original.status}
    />
},

{
    id:"actions",

    cell:({row})=>

    <ActionColumn
        row={row.original}
        actions={taskActions}
    />
}

];