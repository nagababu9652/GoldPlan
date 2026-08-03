import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    roleActions,
} from "./role.actions";

export const roleColumns: ColumnDef<Role>[] = [

{
    accessorKey:"name",

    header:"Role",
},

{
    accessorKey:"description",

    header:"Description",
},

{
    accessorKey:"permissions",

    header:"Permissions",
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
        actions={roleActions}
    />
}

];