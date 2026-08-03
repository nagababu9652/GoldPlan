"use client";

import DataTable from "@/components/data-table";

import {
roleColumns,
} from "./role.columns";

interface Props{

roles:Role[];

}

export default function RoleTable({

roles,

}:Props){

return(

<DataTable

columns={roleColumns}

data={roles}

searchable

filterable

selectable

pagination

exportable

/>

);

}