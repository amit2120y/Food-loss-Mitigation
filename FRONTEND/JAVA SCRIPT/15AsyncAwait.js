// Async Function

async function greet(){
    // return "pawan";
    return new Promise((resolve,reject)=>{
        // resolve("Pawan");
        reject("Pawan");
    })

}
const response=greet();
console.log(response);
//async function is used before any function and it will always return a promise.


response.then((inf)=>console.log(inf))
.catch((error)=>{
    console.log("Error:",error);
})



// Await Function:it freezes the program

const response1= await fetch("https://api.github.com/users");

const data1=await response1.json();
console.log(data1);



//more optimized way:
 async function github(){
    const response1= await fetch("https://api.github.com/users");
   

const data1=await response1.json();
console.log(data1);

}
github();
console.log("hello world");







