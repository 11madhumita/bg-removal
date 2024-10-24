import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    clerkID: { type:String, requried:true, unique:true},
    email: { type:String, requried:true, unique:true },
    photo:{ type:String, requried:true},
    firstName:{type:String },
    lastName : {type:String},
    creditBalance:{ type:Number, default:5}
})
const userModel = mongoose.models.user || mongoose.model("user",userSchema)

export default userModel;