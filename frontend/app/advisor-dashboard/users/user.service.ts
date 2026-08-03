export async function getUsers(){

return fetch("/api/users")
.then(res=>res.json());

}

export async function deleteUser(id:string){

return fetch(`/api/users/${id}`,{

method:"DELETE",

});

}