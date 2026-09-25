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
    mutualFundActions,
} from "./mutual-fund.actions";

import { MutualFund } from "@/components/data-table/examples/mutual-fund.types";

export const mutualFundColumns: ColumnDef<MutualFund>[] = [

{
    accessorKey:"scheme",

    header:"Scheme",
},

{
    accessorKey:"amc",

    header:"AMC",
},

{
    accessorKey:"nav",

    header:"NAV",

    cell:({row})=>

    <CurrencyColumn
        value={row.original.nav}
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
        actions={mutualFundActions}
    />
}

];