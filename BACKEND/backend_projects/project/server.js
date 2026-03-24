const express=require("express");
const app=express();


app.use(express.json());
let users=[];


app.post("/register",(req,res)=>{
    const {username,password}=req.body;
    console.log(req.body);
    const existingUsers=users.find(user=>user.username==username);
    if(existingUsers)
        res.send("Users Already Exists.");

    users.push({username,password});
    res.status(201).send("Registration Successfull");
});
// app.post("/login",(req,res)=>{
//     const 
//     res.send("Login Succesfull");
// })


// app.get("/register",(req,res)=>{
//     res.send(users);
// })






app.listen(1000,()=>{
    console.log("Listening at Port number 1000");
 })










