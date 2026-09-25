"use client";

import { DataTable } from "@/components/data-table";

import {
branchColumns,
} from "./branch.columns";

import { Branch } from "@/components/data-table/examples/branch.types";

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