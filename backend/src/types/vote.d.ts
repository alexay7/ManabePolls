import { Types } from "mongoose";

export type VoteType = {
    _id:Types.ObjectId,

    user:string,
    poll:Types.ObjectId,
    category:"anime"|"manga"|"novel"|"vn"|"live",

    options:Types.ObjectId[]
}