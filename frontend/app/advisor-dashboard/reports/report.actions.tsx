import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

import { RowAction } from "@/components/data-table/actions";
import { Report } from "@/components/data-table/examples/report.types";

export const reportActions: RowAction<Report>[] = [
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(_report: Report)=>{}
    },
    {
        id:"edit",
        label:"Edit",
        icon:<Pencil size={16}/>,
        onClick:(_report: Report)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(_report: Report)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(_report: Report)=>{}
    }
];