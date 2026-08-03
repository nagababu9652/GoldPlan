"use client";

import DataTable from "@/components/data-table";

import {
prospectColumns,
} from "./prospect.columns";

interface Props{

prospects:Prospect[];

}

export default function ProspectTable({

prospects,

}:ProspectTableProps){

return(

<DataTable

columns={prospectColumns}

data={prospects}

searchable

filterable

selectable

pagination

exportable

/>

);

}