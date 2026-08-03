import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    prospectActions,
} from "./prospect.actions";

export const prospectColumns: ColumnDef<Prospect>[] = [

{
    accessorKey:"name",

    header:"Name",
},

{
    accessorKey:"email",

    header:"Email",
},

{
    accessorKey:"phone",

    header:"Phone",
},

{
    accessorKey:"source",

    header:"Source",
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
        actions={prospectActions}
    />
}

];