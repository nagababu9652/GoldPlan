export async function getCustomers(){

return fetch("/api/customers")
.then(res=>res.json());

}

export async function deleteCustomer(id:string){

return fetch(`/api/customers/${id}`,{

method:"DELETE",

});

}