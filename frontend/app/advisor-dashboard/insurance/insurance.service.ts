export async function getInsurancePolicies(){

return fetch("/api/insurance")
.then(res=>res.json());

}

export async function deleteInsurancePolicy(id:string){

return fetch(`/api/insurance/${id}`,{

method:"DELETE",

});

}