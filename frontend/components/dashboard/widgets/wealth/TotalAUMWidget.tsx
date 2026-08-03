"use client";

import {
    Wallet
} from "lucide-react";

import {
    KPIWidget
} from "../kpi";

interface Props{

value:number;

trend:number;

}

export default function TotalAUMWidget({

value,

trend,

}:Props){

return(

<KPIWidget

title="Total AUM"

value={`₹ ${value.toLocaleString("en-IN")}`}

icon={Wallet}

trend={trend}

trendLabel="vs last month"

color="success"

sparkline={[82,84,88,92,95,101,108]}

/>

);

}