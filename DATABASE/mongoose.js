const mongoose=require('mongoose');
const {Schema}=mongoose;

async function main() {

    await mongoose.connect("mongodb+srv://narottampandey7781_db_user:np123456@cluster1.gsmvpsq.mongodb.net/Bookstore");

    // defining a schema
    // const user_schema=new Schema({
    //     name:String,
    //     age:Number,
    //     city:String,
    //     gender:String
    // });

    // creation of model:means creating a collection(creating your own table)
    //const user = mongoose.model("user",user_schema);   //here "user" is collection name
    //inserting a new  user:
    // const user1 = new user({name:"Sahil",age:22,city:"Delhi",gender:"Male"});
    // await user1.save();


    //either it can also be done in single step:
    // await user.create({name:"Sahil",age:22,city:"Delhi",gender:"Male"});

    // to insert multiple data:
    //await user.insertMany([{name:"Arpita",age:26},{name:"Ankita",age:30}]);



    //to find data:
    // const users=await user.find({});
    // console.log(users);

    //to find a particular document by a particular field:
    // const result=await user.find({name:"Arpita"});
    // console.log(result);



}
// main()
// .then(()=>console.log("connected to Mongoose"))
// .catch((err)=>console.log(err));
module.exports=main;