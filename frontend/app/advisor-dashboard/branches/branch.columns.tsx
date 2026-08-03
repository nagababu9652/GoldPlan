import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    branchActions,
} from "./branch.actions";

export const branchColumns: ColumnDef<Branch>[] = [

{
    accessorKey:"name",

    header:"Branch Name",
},

{
    accessorKey:"address",

    header:"Address",
},

{
    accessorKey:"phone",

    header:"Phone",
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
        actions={branchActions}
    />
}

];