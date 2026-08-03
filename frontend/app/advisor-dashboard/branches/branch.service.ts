export async function getBranches(){
    return fetch("/api/branches")
    .then(res=>res.json());
}

export async function deleteBranch(id:string){
    return fetch(`/api/branches/${id}`,{
        method:"DELETE",
    });
}