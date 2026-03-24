const mongoose=require('mongoose');
const {Schema}=mongoose;

async function Sanitization() {

    await mongoose.connect("mongodb+srv://narottampandey7781_db_user:np123456@cluster1.gsmvpsq.mongodb.net/Sanitization");
}
module.exports=Sanitization;