"use client";

import DataTable from "@/components/data-table";

import {
leadColumns,
} from "./lead.columns";

interface Props{

leads:Lead[];

}

export default function LeadTable({

leads,

}:Props){

return(

<DataTable

columns={leadColumns}

data={leads}

searchable

filterable

selectable

pagination

exportable

/>

);

}