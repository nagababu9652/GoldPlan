export async function getProspects(){
    return fetch("/api/prospects")
    .then(res=>res.json());
}

export async function deleteProspect(id:string){
    return fetch(`/api/prospects/${id}`,{
        method:"DELETE",
    });
}