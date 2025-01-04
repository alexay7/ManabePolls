import { Types } from "mongoose";

export type UserType = {
    _id:Types.ObjectId,

    userId:string,

    tickets:number;
}