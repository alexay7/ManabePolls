import mongoose, { Schema } from "mongoose";
import { UserType } from "../types/user";

const userSchema = new Schema<UserType>({
    userId: {
        type:String,
        required:true
    },
    tickets: {
        type:Number,
        required:true
    }
});

export const User = mongoose.model('User', userSchema);

userSchema.index({userId:1}, {unique:true});