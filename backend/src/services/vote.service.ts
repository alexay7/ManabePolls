import { Types } from "mongoose";
import { Vote } from "../models/vote.model";
import { VoteType } from "../types/vote";
import { pollService } from "./polls.service";

export const voteService = {
    async createVote(newVote:Omit<VoteType,"_id">){
        return Vote.create(newVote);
    },
    async findVoteByUserAndPoll(user:string,poll:string,category:string) {
        return Vote.findOne({user,poll,category});
    },
    async computeVotesByCategory(poll:Types.ObjectId,category:"anime"|"manga"|"novel"|"vn"|"live") {
        // Search the poll to check if it exists
        const foundPoll = await pollService.findPollById(poll);

        const voteResults = await Vote.aggregate<{category:"anime"|"manga"|"novel"|"vn"|"live",option:Types.ObjectId,votes:number,voters:string[]}>()
            .match({poll,category})
            .unwind("$options")
            .group({
                _id: {
                    option: "$options.option",
                    poll: "$poll",
                    category: "$category"
                },
                votes: {
                    $sum: "$options.votes"
                },
                voters:{
                    $push:"$user"
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
                        votes: "$votes",
                        voters:"$voters"
                    }
                }
            })
            .unwind({
                path: "$options"
            })
            .replaceRoot({
                category: "$_id.category",
                option: "$options.option",
                votes: "$options.votes",
                voters:"$options.voters"
            });

        // Search the proposer of the option and add it to voters
        const proposer = foundPoll![category].find((option) => option._id.equals(voteResults[0].option))?.proposer;

        if (proposer){
            voteResults[0].voters.push(proposer);
        }

        return voteResults;
    },
    async getTotalPollVoters(poll:Types.ObjectId) {
        return Vote.aggregate<{_id:string}>()
            .match({poll})
            .group({
                _id: "$user"
            });
    }
};