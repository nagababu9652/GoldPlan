"use client";

import { Card } from "@/components/ui/card";

interface Props{

total:number;

sip:number;

purchase:number;

}

export default function TransactionsSummary({

total,

sip,

purchase

}:Props){

return(

<div className="grid md:grid-cols-3 gap-4">

<Card className="p-5">

<p>Total Transactions</p>

<h2 className="text-2xl font-bold">

{total}

</h2>

</Card>

<Card className="p-5">

<p>SIP Amount</p>

<h2 className="text-2xl font-bold">

₹ {sip.toLocaleString("en-IN")}

</h2>

</Card>

<Card className="p-5">

<p>Purchase Amount</p>

<h2 className="text-2xl font-bold">

₹ {purchase.toLocaleString("en-IN")}

</h2>

</Card>

</div>

);

}