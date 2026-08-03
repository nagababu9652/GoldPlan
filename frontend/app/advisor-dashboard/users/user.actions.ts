import {
Eye,
Pencil,
Trash2,
History,
} from "lucide-react";

export const userActions=[

{

id:"view",

label:"View",

icon:<Eye size={16}/>,

onClick:(user)=>{

}
},

{

id:"edit",

label:"Edit",

icon:<Pencil size={16}/>,

onClick:(user)=>{

}
},

{

id:"history",

label:"History",

icon:<History size={16}/>,

onClick:(user)=>{

}
},

{

id:"delete",

label:"Delete",

icon:<Trash2 size={16}/>,

variant:"danger",

onClick:(user)=>{

}
}

];