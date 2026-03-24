console.log("hello we'll start now");

// const p1=fetch("https://api.github.com/users");
// console.log(p1);

// //fulfilled and reject:
// const p2=p1.then((Response)=>{
//     // console.log(Response.json());
//     return Response.json();
// })

// p2.then((Response)=>{
//     console.log(Response);
// })


// OR:better way:

fetch("https://api.github.com/uers")
.then((Response)=>{
    console.log(Response);
    if(!Response.ok){
        throw new Error("Data is not present in server");
    }
    return Response.json();
})
.then((data)=>{
    console.log(data);


    const parent=document.getElementById("parent");
    for(let i=0;i<data.length;i++){
    const image=document.createElement('img');
    image.src=data[i].avatar_url;
    image.style.height="30px";
    image.style.width="30px";

    parent.append(image);}

 })
// let say if there is any error or bug from client or server site and we have to show some meassages on the user interface then how can we show that:
.catch((error)=>{
    const parent=document.getElementById("parent");
    parent.textContent=error.message;

})



// JSON:(Java Script Object Notation) it's an java script string format which can be understand by all the programming language  

//conersion in JSON:
// const j1={
//     name:"Rohit",
//     age:21,
//     address:"Lucknow"
// }
// //converting to JSON
// const jsonFormat=JSON.stringify(j1);

// console.log(jsonFormat); 

// //java script object:
// const JsObject=JSON.parse(jsonFormat);
// console.log(JsObject);


