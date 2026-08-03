import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

export const auditActions=[
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(audit:any)=>{}
    },
    {
        id:"edit",
        label:"Edit",
        icon:<Pencil size={16}/>,
        onClick:(audit:any)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(audit:any)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(audit:any)=>{}
    }
];