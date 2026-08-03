export const taskFilters=[
    {
        id:"status",
        label:"Status",
        type:"select",
        options:[
            {label:"Pending", value:"pending"},
            {label:"In Progress", value:"in_progress"},
            {label:"Completed", value:"completed"}
        ]
    },
    {
        id:"priority",
        label:"Priority",
        type:"select",
        options:[
            {label:"Low", value:"low"},
            {label:"Medium", value:"medium"},
            {label:"High", value:"high"}
        ]
    }
];