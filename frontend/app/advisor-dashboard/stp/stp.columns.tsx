import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    CurrencyColumn,
    DateColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    stpActions,
} from "./stp.actions";

export const stpColumns: ColumnDef<STP>[] = [

{
    accessorKey:"scheme",

    header:"Scheme",
},

{
    accessorKey:"amount",

    header:"Amount",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.amount}
    />
},

{
    accessorKey:"frequency",

    header:"Frequency",
},

{
    accessorKey:"nextDate",

    header:"Next Date",

    cell:({row})=>

    <DateColumn
        value={row.original.nextDate}
    />
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
        actions={stpActions}
    />
}

];