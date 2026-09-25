import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    reportActions,
} from "./report.actions";

import { Report } from "@/components/data-table/examples/report.types";

export const reportColumns: ColumnDef<Report>[] = [

{
    accessorKey:"name",

    header:"Report Name",
},

{
    accessorKey:"type",

    header:"Type",
},

{
    accessorKey:"generatedAt",

    header:"Generated At",
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
        actions={reportActions}
    />
}

];