import {
    ColumnDef,
} from "@tanstack/react-table";

import {
    AvatarColumn,
    StatusColumn,
    ActionColumn,
} from "@/components/data-table";

import {
    userActions,
} from "./user.actions";

export const userColumns: ColumnDef<User>[] = [

{
    accessorKey:"name",

    header:"User",

    cell:({row})=>

    <AvatarColumn
        name={row.original.name}
        image={row.original.image}
    />
},

{
    accessorKey:"email",

    header:"Email",
},

{
    accessorKey:"role",

    header:"Role",
},

{
    accessorKey:"status",

    header:"Status",

    cell:({row})=>

    <StatusColumn
        value={row.original.status}
    />
},

{
    id:"actions",

    cell:({row})=>

    <ActionColumn
        row={row.original}
        actions={userActions}
    />
}

];