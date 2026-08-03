export async function getNotifications(){
    return fetch("/api/notifications")
    .then(res=>res.json());
}

export async function deleteNotification(id:string){
    return fetch(`/api/notifications/${id}`,{
        method:"DELETE",
    });
}