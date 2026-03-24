const express=require('express');

const app=express();
//PARSING:

app.use(express.json());

app.get("/user", (req,res)=>{
    res.send("Hii user,You're welcome");
})

app.post("/user", (req,res)=>{

    
    console.log(typeof req.body.age);
    // console.log("hii data saved successfully");


    res.send("Hii user here i used post request is used to save the data inn the backend");
})

app.listen(4000,()=>{
    console.log("listening at port number 4000");
})  



// app.use((req,res)=>{

//     res.send({name:"Narottam"});
// })


// app.listen(4000,()=>{
//     console.log("Listening Port number 4000");
// })







