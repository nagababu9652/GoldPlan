import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    auditActions,
} from "./audit.actions";

export const auditColumns: ColumnDef<Audit>[] = [

{
    accessorKey:"action",

    header:"Action",
},

{
    accessorKey:"entity",

    header:"Entity",
},

{
    accessorKey:"userId",

    header:"User ID",
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
        actions={auditActions}
    />
}

];