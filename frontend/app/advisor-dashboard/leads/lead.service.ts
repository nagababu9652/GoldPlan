export async function getLeads(){
    return fetch("/api/leads")
    .then(res=>res.json());
}

export async function deleteLead(id:string){
    return fetch(`/api/leads/${id}`,{
        method:"DELETE",
    });
}