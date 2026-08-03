import {
Eye,
Trash2,
History,
} from "lucide-react";

export const notificationActions=[
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(notification:any)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(notification:any)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(notification:any)=>{}
    }
];