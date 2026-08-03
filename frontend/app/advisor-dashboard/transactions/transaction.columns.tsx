import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    AvatarColumn,
    StatusColumn,
    CurrencyColumn,
    DateColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    transactionActions,
} from "./transaction.actions";

export const transactionColumns: ColumnDef<Transaction>[] = [

{
    accessorKey:"type",

    header:"Type",
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
    accessorKey:"date",

    header:"Date",

    cell:({row})=>

    <DateColumn
        value={row.original.date}
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
        actions={transactionActions}
    />
}

];