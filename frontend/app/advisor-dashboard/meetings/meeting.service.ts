export async function getMeetings(){
    return fetch("/api/meetings")
    .then(res=>res.json());
}

export async function deleteMeeting(id:string){
    return fetch(`/api/meetings/${id}`,{
        method:"DELETE",
    });
}