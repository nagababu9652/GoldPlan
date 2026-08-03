export async function getStps(){

return fetch("/api/stp")
.then(res=>res.json());

}

export async function deleteStp(id:string){

return fetch(`/api/stp/${id}`,{

method:"DELETE",

});

}