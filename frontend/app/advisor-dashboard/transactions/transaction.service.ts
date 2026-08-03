export async function getTransactions(){

return fetch("/api/transactions")
.then(res=>res.json());

}

export async function deleteTransaction(id:string){

return fetch(`/api/transactions/${id}`,{

method:"DELETE",

});

}