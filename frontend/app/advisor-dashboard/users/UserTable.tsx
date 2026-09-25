"use client";

import { DataTable } from "@/components/data-table";

import {
userColumns,
} from "./user.columns";

import { User } from "@/components/data-table/examples/user.types";

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