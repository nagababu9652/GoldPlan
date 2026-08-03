"use client";

import {

Widget,

WidgetHeader,

WidgetBody,

WidgetMenu,

} from "../base";

import {

DashboardDonutChart,

} from "../../charts";

const data=[

{

name:"Equity",

value:48,

},

{

name:"Debt",

value:25,

},

{

name:"Gold",

value:12,

},

{

name:"International",

value:10,

},

{

name:"Cash",

value:5,

}

];

export default function PortfolioAllocationWidget(){

return(

<Widget>

<WidgetHeader

title="Portfolio Allocation"

actions={<WidgetMenu/>}

/>

<WidgetBody>

<DashboardDonutChart

data={data}

/>

</WidgetBody>

</Widget>

);

}