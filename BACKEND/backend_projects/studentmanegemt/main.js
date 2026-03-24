const express=require("express");
const app=express();
const student=[
    {
    id:1,name:"Narottam Pandey",course:"integrated MSc"
},
{
    id:2,name:"Utkarsh Singh",course:"BCA"
},
{
    id:3,name:"Sidharth",Cousre:"BTech"
}
]

app.use(express.json());


app.get("/student",(req,res)=>{
    
    res.send(student)
})


app.get("/student/:id",(req,res)=>{
    const data=parseInt(req.params.id);
    const Student=student.find(info=>info.id===data);
    res.send(Student);
})

app.post("/student",(req,res)=>{
    student.push(req.body);
    console.log(student);
    res.send("The student has been added in the list ");


})

app.patch("/student",(req,res)=>{

    const Student=student.find(info=>info.id===req.body.id);

    if(req.body.name)
    Student.name=req.body.name;

    if(req.body.course)
    Student.course=req.body.course;

    res.send("The List has been updated");

    
})

app.delete("/student/:id",(req,res)=>{


   const id= parseInt(req.params.id);

   const data=student.findIndex(info=>info.id===id);

   student.splice(data,1);
   res.send("deleted");
})







app.listen(2000,()=>{
    console.log("The Server is running in port number 2000");
})