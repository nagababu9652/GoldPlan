"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { Transaction } from "./types";

export const transactionColumns: ColumnDef<Transaction>[] = [

{
    accessorKey:"date",
    header:"Date",
},

{
    accessorKey:"scheme",
    header:"Scheme",
},

{
    accessorKey:"type",
    header:"Type",

    cell:({row})=>

    <Badge>
        {row.original.type}
    </Badge>

},

{
    accessorKey:"amount",

    header:"Amount",

    cell:({row})=>

    <>₹ {row.original.amount.toLocaleString("en-IN")}</>

},

{
    accessorKey:"units",

    header:"Units",

},

{
    accessorKey:"nav",

    header:"NAV",

    cell:({row})=>

    <>₹ {row.original.nav}</>

},

{
    accessorKey:"status",

    header:"Status",

    cell:({row})=>

    <Badge variant="success">

        {row.original.status}

    </Badge>

}

];