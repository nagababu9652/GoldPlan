"use client";

import { DataTable } from "@/components/data-table";

import {
swpColumns,
} from "./swp.columns";

import { SWP } from "@/components/data-table/examples/swp.types";

interface Props{

swps:SWP[];

}

export default function SwpTable({

swps,

}:Props){

return(

<DataTable

columns={swpColumns}

data={swps}

searchable

filterable

selectable

pagination

exportable

/>

);

}