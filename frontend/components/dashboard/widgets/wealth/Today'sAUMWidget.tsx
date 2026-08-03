"use client";

import {
Activity
} from "lucide-react";

import {
KPIWidget
} from "../kpi";

export default function TodayAUMWidget(){

return(

<KPIWidget

title="Today's Growth"

value="₹2.8 Cr"

trend={5.8}

icon={Activity}

color="primary"

/>

);

}