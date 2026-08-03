"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Client } from "./types";

import ClientAvatarCell from "./ClientAvatarCell";

import ClientStatusBadge from "./ClientStatusBadge";

import ClientRowActions from "./ClientRowActions";

export const clientColumns:ColumnDef<Client>[]=[

{

accessorKey:"name",

header:"Client",

cell:({row})=>(

<ClientAvatarCell

name={row.original.name}

email={row.original.email}

/>

)

},

{

accessorKey:"advisor",

header:"Advisor",

},

{

accessorKey:"aum",

header:"AUM",

cell:({row})=>

`₹ ${row.original.aum.toLocaleString("en-IN")}`

},

{

accessorKey:"risk",

header:"Risk",

},

{

accessorKey:"status",

header:"Status",

cell:({row})=>

<ClientStatusBadge

status={row.original.status}

/>

},

{

id:"actions",

cell:({row})=>

<ClientRowActions

clientId={row.original.id}

/>

}

];