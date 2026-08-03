import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

export const reportActions=[
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(report:any)=>{}
    },
    {
        id:"edit",
        label:"Edit",
        icon:<Pencil size={16}/>,
        onClick:(report:any)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(report:any)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(report:any)=>{}
    }
];