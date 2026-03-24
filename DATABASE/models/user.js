const mongoose=require('mongoose');
const {Schema}=mongoose;

 const user_schema=new Schema({
        name:String,
        age:Number,
        city:String,
        gender:String
    });
const user = mongoose.model("user",user_schema);   

module.exports=user;



