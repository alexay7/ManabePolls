import { Types } from "mongoose";
import { Vote } from "../models/vote.model";
import { VoteType } from "../types/vote";

export const voteService = {
    async createVote(newVote:Omit<VoteType,"_id">){
        return Vote.create(newVote);
    },
    async findVoteByUserAndPoll(user:string,poll:string,category:string) {
        return Vote.findOne({user,poll,category});
    },
    async computeVotesByCategory(poll:Types.ObjectId,category:string) {
        return Vote.aggregate<{category:string,option:Types.ObjectId,votes:number}>()
            .match({poll,category})
            .unwind("$options")
            .group({
                _id: {
                    option: "$options",
                    poll: "$poll",
                    category: "$category"
                },
                votes: {
                    $sum: 1
                }
            })
            .sort({
                votes: -1
            })
            .group({
                _id: {
                    poll: "$_id.poll",
                    category: "$_id.category"
                },
                options: {
                    $push: {
                        option: "$_id.option",
                        votes: "$votes"
                    }
                }
            })
            .unwind({
                path: "$options"
            })
            .replaceRoot({
                category: "$_id.category",
                option: "$options.option",
                votes: "$options.votes"
            });
    }
};