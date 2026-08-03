"use client";

import DataTable from "@/components/data-table";

import {
stpColumns,
} from "./stp.columns";

interface Props{

stps:STP[];

}

export default function StpTable({

stps,

}:Props){

return(

<DataTable

columns={stpColumns}

data={stps}

searchable

filterable

selectable

pagination

exportable

/>

);

}