import mongoose, { Schema } from "mongoose";
import { VoteType } from "../types/vote";

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
        type: [Schema.Types.ObjectId],
        ref:"Poll.options",
        required:true
    }
});

export const Vote = mongoose.model('Vote', voteSchema);

voteSchema.index({user:1, poll:1, category:1}, {unique:true});