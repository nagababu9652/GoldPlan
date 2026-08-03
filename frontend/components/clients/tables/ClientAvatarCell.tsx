"use client";

import ClientAvatar from "../avatar/ClientAvatar";

interface Props{

name:string;

email:string;

}

export default function ClientAvatarCell({

name,

email,

}:Props){

return(

<div className="flex items-center gap-3">

<ClientAvatar

name={name}

size="md"

/>

<div>

<div className="font-medium">

{name}

</div>

<div className="text-sm text-muted-foreground">

{email}

</div>

</div>

</div>

);

}