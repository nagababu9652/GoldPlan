import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    meetingActions,
} from "./meeting.actions";

export const meetingColumns: ColumnDef<Meeting>[] = [

{
    accessorKey:"title",

    header:"Title",
},

{
    accessorKey:"clientId",

    header:"Client ID",
},

{
    accessorKey:"date",

    header:"Date",
},

{
    accessorKey:"time",

    header:"Time",
},

{
    accessorKey:"type",

    header:"Type",
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
        actions={meetingActions}
    />
}

];