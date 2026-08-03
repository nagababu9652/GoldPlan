"use client";

import DataTable from "@/components/data-table";

import {
customerColumns,
} from "./customer.columns";

interface Props{

customers:Customer[];

}

export default function CustomerTable({

customers,

}:Props){

return(

<DataTable

columns={customerColumns}

data={customers}

searchable

filterable

selectable

pagination

exportable

/>

);

}