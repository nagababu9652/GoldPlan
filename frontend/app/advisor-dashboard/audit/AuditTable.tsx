"use client";

import DataTable from "@/components/data-table";

import {
auditColumns,
} from "./audit.columns";

interface Props{

auditLogs:Audit[];

}

export default function AuditTable({

auditLogs,

}:Props){

return(

<DataTable

columns={auditColumns}

data={auditLogs}

searchable

filterable

selectable

pagination

exportable

/>

);

}