const express=require("express");
const app=express();
// require("../mongoose")

const main=require("../mongoose");
const user=require("./user.js");
app.use(express.json());

app.get("/info",(req,res)=>{
    res.send("Hello All");
})




main()
.then(async ()=>{
    console.log("connected to Database")
    app.listen(3000,()=>{
        console.log("listening at port number 3000")
    })
    const result=await user.find({name:"Arpita"});
    console.log(result);
})
.catch((err)=>console.log(err));
