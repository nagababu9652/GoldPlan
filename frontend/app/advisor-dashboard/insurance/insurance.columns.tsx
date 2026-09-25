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
    insuranceActions,
} from "./insurance.actions";

import { Insurance } from "@/components/data-table/examples/insurance.types";

export const insuranceColumns: ColumnDef<Insurance>[] = [

{
    accessorKey:"policy",

    header:"Policy",
},

{
    accessorKey:"type",

    header:"Type",
},

{
    accessorKey:"premium",

    header:"Premium",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.premium}
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
        actions={insuranceActions}
    />
}

];