export async function getSips(){

return fetch("/api/sip")
.then(res=>res.json());

}

export async function deleteSip(id:string){

return fetch(`/api/sip/${id}`,{

method:"DELETE",

});

}