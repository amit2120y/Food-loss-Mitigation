const express=require("express");

const app=express();


// app.use("/about/:id/:user",(req,res)=>{
//     console.log(req.params);
//     res.send({"name":"NP","age":22,"day":"saturday"});
// })

// app.use("/contact",(req,res)=>{
//     res.send("consider me as your conatct page");
// })

// app.use("/details",(req,res)=>{
//     res.send("I am your details page");
// })

// app.use("/",(req,res)=>{
//     res.send("I am your homepage");
// })

app.listen(4000,()=>{
    console.log("listening at port number 4000");
})  