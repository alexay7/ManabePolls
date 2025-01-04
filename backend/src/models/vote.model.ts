import mongoose, { Schema } from "mongoose";
import { VoteOptionType, VoteType } from "../types/vote";

const optionVoteSchema = new Schema<VoteOptionType>({
    option:{
        type: Schema.Types.ObjectId,
        required:true
    },
    votes:{
        type:Number,
        default:1
    }
},{_id:false});

const voteSchema = new Schema<VoteType>({
    user: {
        type:String,
        required:true
    },
    poll: {
        type: Schema.Types.ObjectId,
        ref:"Poll",
        required:true
    },
    category: {
        type:String,
        enum:["anime","manga","novel","vn","live"],
        required:true
    },

    options: {
        type: [optionVoteSchema],
        required:true
    }
});

export const Vote = mongoose.model('Vote', voteSchema);

voteSchema.index({user:1, poll:1, category:1}, {unique:true});