import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    notificationActions,
} from "./notification.actions";

export const notificationColumns: ColumnDef<Notification>[] = [

{
    accessorKey:"title",

    header:"Title",
},

{
    accessorKey:"message",

    header:"Message",
},

{
    accessorKey:"type",

    header:"Type",
},

{
    accessorKey:"timestamp",

    header:"Timestamp",
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
        actions={notificationActions}
    />
}

];