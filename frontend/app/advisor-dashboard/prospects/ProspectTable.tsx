"use client";

import { DataTable } from "@/components/data-table";

import {
prospectColumns,
} from "./prospect.columns";

import { Prospect } from "@/components/data-table/examples/prospect.types";

interface Props{

prospects:Prospect[];

}

export default function ProspectTable({

prospects,

}:Props){

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