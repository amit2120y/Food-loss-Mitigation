const express=require("express");
const app=express();

app.use(express.json());
let users=[];
 

app.post("/users",(req,res)=>{
    const {username,password}=req.body;
    console.log(req.body);
    const existingUsers=users.find(user=>user.username===username);
    if(existingUsers){
      return res.send("users already present");
    }
    
    users.push({username,password});
    res.send("Registration Successfull");
});


app.get("/users",(req,res)=>{
    res.send(users);
})

app.listen(2000,()=>{
    console.log("Listening at Port number 2000");
 })
