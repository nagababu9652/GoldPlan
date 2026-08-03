"use client";

import {

Repeat,

} from "lucide-react";

import {

KPIWidget,

} from "../kpi";

export default function SIPSummaryWidget(){

return(

<KPIWidget

title="Active SIP"

value="2,483"

trend={8.4}

icon={Repeat}

color="primary"

/>

);

}