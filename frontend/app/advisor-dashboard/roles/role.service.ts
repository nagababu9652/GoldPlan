export async function getRoles(){

return fetch("/api/roles")
.then(res=>res.json());

}

export async function deleteRole(id:string){

return fetch(`/api/roles/${id}`,{

method:"DELETE",

});

}