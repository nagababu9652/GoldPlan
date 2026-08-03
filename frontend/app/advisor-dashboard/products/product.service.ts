export async function getProducts(){
    return fetch("/api/products")
    .then(res=>res.json());
}

export async function deleteProduct(id:string){
    return fetch(`/api/products/${id}`,{
        method:"DELETE",
    });
}