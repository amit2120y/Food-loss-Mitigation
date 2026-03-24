const http=require('http');

const server=http.createServer((req,res)=>{
    // res.end("hello coder army");
    if(req.url==="/"){
        res.end("hello Coder Army");
    }
    else if(req.url==="/contact"){
        res.end("This is our contact page");
    }
    else if(req.url==="/about"){
        res.end("This is our about page");
    }
    else{
        res.end("error page not found");
    }
});

server.listen(4000,()=>{
    console.log("I am listning on Port Number 4000");
})