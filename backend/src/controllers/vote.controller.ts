import { TypedRequest, TypedRequestParams } from "zod-express-middleware";
import { createVoteDto } from "../dto/vote.dto";
import { ZodAny } from "zod";
import { pollEndpointParams, pollTypeEndpointParams } from "../dto/poll.dto";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { VoteType } from "../types/vote";
import { voteService } from "../services/vote.service";
import { pollService } from "../services/polls.service";
import { OptionType } from "../types/polls";
import { discordService } from "../services/discord.service";

export async function createVote(req:TypedRequest<typeof pollTypeEndpointParams,ZodAny,typeof createVoteDto>,
    res:Response, next:NextFunction) {
    try{
        const {type,pollId}=req.params;
        const {id:userId}=req.currentUser!;
        const {body:voteDto}=req;

        // Check if there is a vote for the user in the poll
        const lastVote = await voteService.findVoteByUserAndPoll(userId,pollId,type);

        if (lastVote) {
            return next({ status: 400, message: "You have already voted in this category" });
        }

        // Check if the poll exists
        const foundPoll = await pollService.findPollById(new Types.ObjectId(pollId));

        if (!foundPoll) {
            return next({ status: 404, message: "Poll not found" });
        }

        // Search every option in the vote
        for (const optionId of voteDto.options) {
            const option = foundPoll[type].find((opt:OptionType) => opt._id.equals(optionId));

            if (!option) {
                return next({ status: 404, message: "Option not found" });
            }

            // Check if the user is voting their own option
            if(option.proposer === userId) {
                return next({ status: 400, message: "You cannot vote your own option" });
            }
        }

        const newVote:Omit<VoteType,"_id"> = {
            ...voteDto,
            user:userId,
            poll:new Types.ObjectId(req.params.pollId),
            category:type,
        };

        const result = await voteService.createVote(newVote);

        if (!result) {
            return next({ status: 500, message: "Vote creation failed" });
        }

        return res.status(201).json(result);
    }catch(error) {
        next(error);
    }
}

export async function getUserVotes(req:TypedRequestParams<typeof pollEndpointParams>,res:Response,next:NextFunction) {
    try {
        const {id:userId}=req.currentUser!;
        const {pollId}=req.params;
        const categories = ["anime","manga","novel","vn","live"];

        // Return in format {category:boolean} true if votes exists, false if not
        const results = await Promise.all(categories.map(async (category) => {
            const foundVotes = await voteService.findVoteByUserAndPoll(userId,pollId,category);
            return {[category]:!!foundVotes};
        }));

        // Transform array of objects to object
        const votes = results.reduce((acc,curr) => ({...acc,...curr}),{});

        return res.status(200).json(votes);
    }catch(error) {
        next(error);
    }
}

export async function getPollVotes(req:Request,res:Response,next:NextFunction) {
    try {
        const categories = ["anime","manga","novel","vn","live"];

        const [foundPoll] = await pollService.getLastPoll();

        if (!foundPoll) {
            return next({ status: 404, message: "Poll not found" });
        }

        if (foundPoll.active) {
            return next({ status: 400, message: "Poll is yet active" });
        }

        // Return in format {category:{option:count}}
        const results = await Promise.all(categories.map(async (category) => {
            const foundVotes = (await voteService.computeVotesByCategory(new Types.ObjectId(foundPoll._id),category)).sort((a,b)=>{
                // Order first by votes, then by option name
                if (a.votes > b.votes) {
                    return -1;
                }

                if (a.votes < b.votes) {
                    return 1;
                }

                if (a.option < b.option) {
                    return 1;
                }

                if (a.option > b.option) {
                    return -1;
                }

                return 0;
            });
            return {[category]:foundVotes};
        }));

        // Transform array of objects to object
        const votes = results.reduce((acc,curr) => ({...acc,...curr}),{});

        return res.status(200).json({pollData:foundPoll,votes});
    }catch(error) {
        next(error);
    }
}

export async function computePollVotes(req:TypedRequestParams<typeof pollEndpointParams>,res:Response,next:NextFunction) {
    try {
        const {pollId}=req.params;
        const categories = ["anime","manga","novel","vn","live"];

        // Return in format {category:{option:count}}
        const results = await Promise.all(categories.map(async (category) => {
            const foundVotes = await voteService.computeVotesByCategory(new Types.ObjectId(pollId),category);

            // Get the most voted option, if there is a tie choose randomly
            const mostVotedOption = foundVotes.reduce((acc,curr) => {
                if (!acc) {
                    return curr;
                }

                if (curr.votes > acc.votes) {
                    return curr;
                }

                if (curr.votes === acc.votes) {
                    return Math.random() > 0.5 ? curr : acc;
                }

                return acc;
            },undefined as {option:Types.ObjectId,votes:number}|undefined);

            return {
                [category]: mostVotedOption
            };
        }));

        // Transform array of objects to object
        const votes = results.reduce((acc,curr) => ({...acc,...curr}),{});

        for (const [category,option] of Object.entries(votes)) {
            if (option) {
                const response = await discordService.sendMediaOfTheMonthMessage(category as "anime",new Types.ObjectId(pollId),option.option);

                if (response !== 204) {
                    return next({ status: 500, message: "Error sending message to discord" });
                }
            }
        }

        // Disable poll
        await pollService.endPoll(new Types.ObjectId(pollId));

        return res.status(200).json({message:"Votes computed"});

    }catch(error) {
        next(error);
    }
}