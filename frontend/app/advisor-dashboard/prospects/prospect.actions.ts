import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

export const prospectActions=[
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(prospect:any)=>{}
    },
    {
        id:"edit",
        label:"Edit",
        icon:<Pencil size={16}/>,
        onClick:(prospect:any)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(prospect:any)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(prospect:any)=>{}
    }
];