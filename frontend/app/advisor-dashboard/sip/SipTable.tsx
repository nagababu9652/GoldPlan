"use client";

import DataTable from "@/components/data-table";

import {
sipColumns,
} from "./sip.columns";

interface Props{

sips:SIP[];

}

export default function SipTable({

sips,

}:Props){

return(

<DataTable

columns={sipColumns}

data={sips}

searchable

filterable

selectable

pagination

exportable

/>

);

}