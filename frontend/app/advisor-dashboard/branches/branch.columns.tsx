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

import { Branch } from "@/components/data-table/examples/branch.types";

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