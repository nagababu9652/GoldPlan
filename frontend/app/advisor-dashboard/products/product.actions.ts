import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

export const productActions=[
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(product:any)=>{}
    },
    {
        id:"edit",
        label:"Edit",
        icon:<Pencil size={16}/>,
        onClick:(product:any)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(product:any)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(product:any)=>{}
    }
];