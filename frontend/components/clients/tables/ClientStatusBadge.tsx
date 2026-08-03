"use client";

import { Badge } from "@/components/ui/badge";

import { ClientStatus } from "./types";

interface Props{

status:ClientStatus;

}

const variants={

ACTIVE:"default",

INACTIVE:"secondary",

PROSPECT:"outline",

BLOCKED:"destructive",

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