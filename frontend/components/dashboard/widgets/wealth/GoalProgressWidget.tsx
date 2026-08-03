"use client";

import {

Widget,

WidgetHeader,

WidgetBody,

} from "../base";

import {

Progress,

} from "@/components/ui/progress";

export default function GoalProgressWidget(){

return(

<Widget>

<WidgetHeader

title="Goal Completion"

/>

<WidgetBody>

<div className="space-y-5">

<div>

<div className="mb-2 flex justify-between">

<span>Retirement</span>

<span>72%</span>

</div>

<Progress value={72}/>

</div>

<div>

<div className="mb-2 flex justify-between">

<span>Child Education</span>

<span>58%</span>

</div>

<Progress value={58}/>

</div>

<div>

<div className="mb-2 flex justify-between">

<span>House Purchase</span>

<span>81%</span>

</div>

<Progress value={81}/>

</div>

</div>

</WidgetBody>

</Widget>

);

}