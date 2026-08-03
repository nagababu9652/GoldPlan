"use client";

import {

Eye,

Pencil,

Trash,

} from "lucide-react";

import {

DropdownMenu,

DropdownMenuContent,

DropdownMenuItem,

DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

interface Props{

clientId:string;

}

export default function ClientRowActions({

clientId,

}:Props){

return(

<DropdownMenu>

<DropdownMenuTrigger asChild>

<Button

variant="ghost"

size="icon"

>

•••

</Button>

</DropdownMenuTrigger>

<DropdownMenuContent align="end">

<DropdownMenuItem>

<Eye className="mr-2 h-4 w-4"/>

View

</DropdownMenuItem>

<DropdownMenuItem>

<Pencil className="mr-2 h-4 w-4"/>

Edit

</DropdownMenuItem>

<DropdownMenuItem className="text-red-600">

<Trash className="mr-2 h-4 w-4"/>

Delete

</DropdownMenuItem>

</DropdownMenuContent>

</DropdownMenu>

);

}