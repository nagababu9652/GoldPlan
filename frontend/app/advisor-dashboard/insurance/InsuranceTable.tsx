"use client";

import { DataTable } from "@/components/data-table";

import {
insuranceColumns,
} from "./insurance.columns";

import { Insurance } from "@/components/data-table/examples/insurance.types";

interface Props{

insurancePolicies:Insurance[];

}

export default function InsuranceTable({

insurancePolicies,

}:Props){

return(

<DataTable

columns={insuranceColumns}

data={insurancePolicies}

searchable

filterable

selectable

pagination

exportable

/>

);

}