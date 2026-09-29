import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

import { RowAction } from "@/components/data-table/actions";
import { Portfolio } from "@/components/data-table/examples/portfolio.types";

export const portfolioActions: RowAction<Portfolio>[] = [

{

id:"view",

label:"View",

icon:<Eye size={16}/>,

onClick:(_portfolio: Portfolio)=>{

}
},

{

id:"edit",

label:"Edit",

icon:<Pencil size={16}/>,

onClick:(_portfolio: Portfolio)=>{

}
},

{

id:"history",

label:"History",

icon:<History size={16}/>,

onClick:(_portfolio: Portfolio)=>{

}
},

{

id:"delete",

label:"Delete",

icon:<Trash2 size={16}/>,

variant:"danger",

onClick:(_portfolio: Portfolio)=>{

}
}

];