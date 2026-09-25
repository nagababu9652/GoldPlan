"use client";

import { Badge } from "@/components/ui/badge";

import { ClientStatus } from "./types";

interface Props{

status:ClientStatus;

}

const variants={

ACTIVE:"success",

INACTIVE:"secondary",

PROSPECT:"outline",

BLOCKED:"danger",

} as const;

export default function ClientStatusBadge({

status,

}:Props){

return(

<Badge variant={variants[status]}>

{status}

</Badge>

);

}