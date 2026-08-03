import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    AvatarColumn,
    StatusColumn,
    CurrencyColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    customerActions,
} from "./customer.actions";

export const customerColumns: ColumnDef<Customer>[] = [

{
    accessorKey:"name",

    header:"Customer",

    cell:({row})=>

    <AvatarColumn
        name={row.original.name}
        image={row.original.photo}
    />
},

{
    accessorKey:"pan",

    header:"PAN",
},

{
    accessorKey:"mobile",

    header:"Mobile",
},

{
    accessorKey:"aum",

    header:"AUM",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.aum}
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
        actions={customerActions}
    />
}

];