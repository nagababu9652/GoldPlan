export async function getReports(){
    return fetch("/api/reports")
    .then(res=>res.json());
}

export async function deleteReport(id:string){
    return fetch(`/api/reports/${id}`,{
        method:"DELETE",
    });
}