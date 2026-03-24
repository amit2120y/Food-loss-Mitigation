async function github(){
    try {
    const response1= await fetch("https://api.github.com/users");
    if(!response1.ok){
        throw new Error("Data Is Not Present");
    }
     
    const data=await response1.json();
    

    const parent=document.getElementById("first");

    
    for(let user of data ){
        const element=document.createElement("div");
        element.classList.add("user");

        const image=document.createElement('img');
        image.src=user.avatar_url;

        const username=document.createElement('h2');
        username.textContent=user.login;

        const anchor=document.createElement('a');
        anchor.href=user.html_url;
        anchor.textContent="visit Profile";


        element.append(image,username,anchor);
        parent.append(element);

    }
     }
     catch(error){
        console.log("error");
     }
}
github();

