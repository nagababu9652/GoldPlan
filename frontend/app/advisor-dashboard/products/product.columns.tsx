import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    StatusColumn,
    CurrencyColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    productActions,
} from "./product.actions";

export const productColumns: ColumnDef<Product>[] = [

{
    accessorKey:"name",

    header:"Product",
},

{
    accessorKey:"category",

    header:"Category",
},

{
    accessorKey:"price",

    header:"Price",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.price}
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
        actions={productActions}
    />
}

];