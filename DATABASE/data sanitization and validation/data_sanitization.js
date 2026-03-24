const mongoose=require('mongoose');
const {schema}=mongoose;


const user=new Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    age:{
        type:String
    },
    gender:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    photo:{
        type:String
    }
})

const Person=mongoose.model("People",userSchema);

module.exports=Person;















