import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

import { RowAction } from "@/components/data-table/actions";

export const meetingActions: RowAction<any>[] = [
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(meeting:any)=>{}
    },
    {
        id:"edit",
        label:"Edit",
        icon:<Pencil size={16}/>,
        onClick:(meeting:any)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(meeting:any)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(meeting:any)=>{}
    }
];