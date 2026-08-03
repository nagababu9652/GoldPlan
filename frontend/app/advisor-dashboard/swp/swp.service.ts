export async function getSwps(){

return fetch("/api/swp")
.then(res=>res.json());

}

export async function deleteSwp(id:string){

return fetch(`/api/swp/${id}`,{

method:"DELETE",

});

}