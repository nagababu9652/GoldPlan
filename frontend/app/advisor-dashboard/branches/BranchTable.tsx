"use client";

import DataTable from "@/components/data-table";

import {
branchColumns,
} from "./branch.columns";

interface Props{

branches:Branch[];

}

export default function BranchTable({

branches,

}:Props){

return(

<DataTable

columns={branchColumns}

data={branches}

searchable

filterable

selectable

pagination

exportable

/>

);

}