"use client";

import DataTable from "@/components/data-table";

import {
userColumns,
} from "./user.columns";

interface Props{

users:User[];

}

export default function UserTable({

users,

}:Props){

return(

<DataTable

columns={userColumns}

data={users}

searchable

filterable

selectable

pagination

exportable

/>

);

}