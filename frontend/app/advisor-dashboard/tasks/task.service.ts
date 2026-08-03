export async function getTasks(){
    return fetch("/api/tasks")
    .then(res=>res.json());
}

export async function deleteTask(id:string){
    return fetch(`/api/tasks/${id}`,{
        method:"DELETE",
    });
}