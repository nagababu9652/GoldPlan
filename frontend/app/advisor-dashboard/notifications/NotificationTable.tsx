"use client";

import DataTable from "@/components/data-table";

import {
notificationColumns,
} from "./notification.columns";

interface Props{

notifications:Notification[];

}

export default function NotificationTable({

notifications,

}:Props){

return(

<DataTable

columns={notificationColumns}

data={notifications}

searchable

filterable

selectable

pagination

exportable

/>

);

}