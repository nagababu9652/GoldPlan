"use client";

import DataTable from "@/components/data-table";

import {
meetingColumns,
} from "./meeting.columns";

interface Props{

meetings:Meeting[];

}

export default function MeetingTable({

meetings,

}:Props){

return(

<DataTable

columns={meetingColumns}

data={meetings}

searchable

filterable

selectable

pagination

exportable

/>

);

}