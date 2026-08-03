export async function getMutualFunds(){

return fetch("/api/mutual-funds")
.then(res=>res.json());

}

export async function deleteMutualFund(id:string){

return fetch(`/api/mutual-funds/${id}`,{

method:"DELETE",

});

}