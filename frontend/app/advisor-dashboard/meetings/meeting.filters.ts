export const meetingFilters=[
    {
        id:"status",
        label:"Status",
        type:"select",
        options:[
            {label:"Scheduled", value:"scheduled"},
            {label:"Completed", value:"completed"},
            {label:"Cancelled", value:"cancelled"}
        ]
    },
    {
        id:"type",
        label:"Type",
        type:"select",
        options:[
            {label:"Virtual", value:"virtual"},
            {label:"In-Person", value:"in_person"},
            {label:"Phone", value:"phone"}
        ]
 }
];