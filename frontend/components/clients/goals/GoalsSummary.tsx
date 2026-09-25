"use client";

import { Card } from "@/components/ui/card";

interface Props {

total:number;

target:number;

current:number;

}

export default function GoalsSummary({

total,

target,

current

}:Props){

return(

<div className="grid md:grid-cols-3 gap-4">

<Card className="p-5">

<p>Total Goals</p>

<h2 className="text-3xl font-bold">

{total}

</h2>

</Card>

<Card className="p-5">

<p>Total Target</p>

<h2 className="text-2xl font-bold">

₹{target.toLocaleString("en-IN")}

</h2>

</Card>

<Card className="p-5">

<p>Current Corpus</p>

<h2 className="text-2xl font-bold">

₹{current.toLocaleString("en-IN")}

</h2>

</Card>

</div>

);

}