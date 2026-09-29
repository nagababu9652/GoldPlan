import {
Eye,
Trash2,
History,
} from "lucide-react";

import { RowAction } from "@/components/data-table/actions";
import { Notification } from "@/components/data-table/examples/notification.types";

export const notificationActions: RowAction<Notification>[] = [
    {
        id:"view",
        label:"View",
        icon:<Eye size={16}/>,
        onClick:(_notification: Notification)=>{}
    },
    {
        id:"history",
        label:"History",
        icon:<History size={16}/>,
        onClick:(_notification: Notification)=>{}
    },
    {
        id:"delete",
        label:"Delete",
        icon:<Trash2 size={16}/>,
        variant:"danger",
        onClick:(_notification: Notification)=>{}
    }
];