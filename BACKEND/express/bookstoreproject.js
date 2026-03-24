const express=require("express");
const app=express();

const Bookstore=[
    {
        id:1,name:"Harry Potter", author:"DevFlux"
    },
    {
        id:2,name:"Friends",author:"Vikas"
    },
    {
        id:3,name:"Nexus",author:"Rohit"
    },
    {
        id:4,name:"strike",author:"Rohit"
    }
];


app.use(express.json());     



app.get("/book",(req,res)=>{

    console.log(req.query);
    const Book=Bookstore.filter(info=>info.author===req.query.author);

    res.send(Book);

});

app.get("/book/:id",(req,res)=>{
    // console.log(req.params);
    const data=parseInt(req.params.id);
    const Book=Bookstore.find(info=>info.id===data);
    res.send(Book);
    // res.send("this is the book of asked id");
});

app.post("/book",(req,res)=>{
    console.log(req.body);
    Bookstore.push(req.body);
    res.send("Data Saved Successfully");
});


app.patch("/book",(req,res)=>{
    console.log(req.body);
    const Book=Bookstore.find(inf0=>inf0.id===req.body.id);

    if(req.body.author)
    Book.author=req.body.author;

    if(req.body.name)
    Book.name=req.body.name;

    res.send("Changes have been done successsfully");
});


app.put("/book",(req,res)=>{
    const book=Bookstore.find(info =>info.id===req.body.id);

    // if(req.body.author)
    Bookstore.author=req.body.author;

    // if(req.body.name)
    Bookstore.name=req.body.name;


    console.log(req.body);
    res.send("Changes has been updated through PUT  ");
})

app.delete("/book/:id",(req,res)=>{

    const id=parseInt(req.params.id);
    const index=Bookstore.findIndex(inf0=>inf0.id===id);
    Bookstore.splice(index,1);


    res.send("Deleted Successfully");
})




app.listen(5000,()=>{
    console.log("listening at port number 5000");
});



//CONCEPT PF MIDDLEWARE:
//when we use any REST API(it just send one requests and the server responds its once only then the connection(web socket) got breaked and we have to make another requests but.......


app.use("/users",(req,res)=>{
    console.log("First First");
    res.send("I am first");
},
(req,res)=>{
    console.log("Now second");
    res.send("I am second");
})
//here only first function will executes as in JS function executes line by Line so it will break once every line is executed so the next function doesn't executes::: so to executes the next function we use the another parameter name "next" which allows to executes the next function.



app.use("/users",(req,res,next)=>{
    console.log("First First");
    // res.send("I am first");
    next();
},
(req,res,next)=>{
    console.log("Now second");
    // res.send("I am second");
    next();
},
(req,res)=>{
    console.log("I am third");
    res.send("I am third");  // here only one respond will be sent as when client make multiple requests through only one channel then server sends only one respond
}
)
// so here each function call is known as "Route HAndler";And The function Where we call next() are "MIDDLEWARES" and the last function is genrally referred as Request handler.



