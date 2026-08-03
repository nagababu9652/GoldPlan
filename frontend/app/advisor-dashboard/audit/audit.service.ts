export async function getAuditLogs(){
    return fetch("/api/audit")
    .then(res=>res.json());
}

export async function deleteAuditLog(id:string){
    return fetch(`/api/audit/${id}`,{
        method:"DELETE",
    });
}