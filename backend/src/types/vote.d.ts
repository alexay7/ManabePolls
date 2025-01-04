import { Types } from "mongoose";

export type VoteOptionType = {
    option:Types.ObjectId,
    votes:number
}

export type VoteType = {
    _id:Types.ObjectId,

    user:string,
    poll:Types.ObjectId,
    category:"anime"|"manga"|"novel"|"vn"|"live",

    options:VoteOptionType[]
}