const express=require('express');
const app=express();
const main=require("./data_sanitization");
const user=require("./sanitization");



Sanitization()
.then(async ()=>{
    console.log("connected to Database");
    app.listen(3000,await()=>{
        console.log("listening at port number 3000")
    })
})
