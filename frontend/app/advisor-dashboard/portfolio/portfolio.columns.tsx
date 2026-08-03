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
    portfolioActions,
} from "./portfolio.actions";

export const portfolioColumns: ColumnDef<Portfolio>[] = [

{
    accessorKey:"name",

    header:"Portfolio",

    cell:({row})=>

    <AvatarColumn
        name={row.original.name}
        image={row.original.image}
    />
},

{
    accessorKey:"type",

    header:"Type",
},

{
    accessorKey:"value",

    header:"Value",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.value}
    />
},

{
    accessorKey:"returns",

    header:"Returns",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.returns}
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
        actions={portfolioActions}
    />
}

];