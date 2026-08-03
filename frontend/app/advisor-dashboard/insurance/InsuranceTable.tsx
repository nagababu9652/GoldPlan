"use client";

import DataTable from "@/components/data-table";

import {
insuranceColumns,
} from "./insurance.columns";

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