export async function getPortfolios(){

return fetch("/api/portfolios")
.then(res=>res.json());

}

export async function deletePortfolio(id:string){

return fetch(`/api/portfolios/${id}`,{

method:"DELETE",

});

}