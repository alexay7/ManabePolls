import { TypedRequest, TypedRequestParams } from "zod-express-middleware";
import { createVoteDto } from "../dto/vote.dto";
import { ZodAny } from "zod";
import { pollEndpointParams, pollTypeEndpointParams } from "../dto/poll.dto";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { VoteOptionType, VoteType } from "../types/vote";
import { voteService } from "../services/vote.service";
import { pollService } from "../services/polls.service";
import { OptionType, PollWinnerVoters } from "../types/polls";
import { discordService } from "../services/discord.service";
import { userService } from "../services/user.service";

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

        const optionVotes:VoteOptionType[]=[];

        // Search every option in the vote
        await Promise.all(voteDto.options.map(async (voteOption) => {
            const option = foundPoll[type].find((opt: OptionType) => opt._id.equals(voteOption.option)) as OptionType;

            if (!option) {
                throw { status: 404, message: "Option not found" };
            }

            // Check if the user is voting their own option
            if (option.proposer === userId) {
                if(voteOption.ticket){
                    // El hecho de que vote ya es un voto extra, quitarle el ticket
                    voteOption.ticket=false;

                    // Decrement user tickets
                    await userService.decrementUserTickets(userId);
                }else{
                    throw { status: 400, message: "You cannot vote your own option" };
                }
            }

            if (voteOption.ticket) {
            // Check if the user has enough tickets
                const userTickets = await userService.getUserTickets(userId);

                if (userTickets < 1) {
                    throw { status: 400, message: "You don't have enough tickets" };
                }

                // Decrement user tickets
                await userService.decrementUserTickets(userId);
            }

            optionVotes.push({
                option:voteOption.option,
                votes:voteOption.ticket ? 2 : 1
            });
        }));

        const newVote:Omit<VoteType,"_id"> = {
            options:optionVotes,
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
        const categories = ["anime","manga","novel","vn","live"] as const;

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
        const categories = ["anime","manga","novel","vn","live"] as const;

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
            },undefined as {category:typeof categories[number],option:Types.ObjectId,votes:number,voters:string[]}|undefined);

            return {
                [category]: mostVotedOption
            };
        })); 

        // Con esto obtengo a los que votaron las opciones que han ganado
        const voters:PollWinnerVoters = results.reduce((acc,curr) => {
            if (!curr) {
                return acc;
            }

            const {category,option,voters} = curr[Object.keys(curr)[0]]!;

            if (!option) {
                return acc;
            }

            return {
                ...acc,
                [category]: {
                    option,
                    voters
                }
            };
        }, {
            anime:{},
            manga:{},
            novel:{},
            vn:{},
            live:{}
        } as PollWinnerVoters);

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

        // Desactivo la encuesta y almaceno los votantes de las opciones ganadoras
        await pollService.endPoll(new Types.ObjectId(pollId),voters);

        return res.status(200).json({message:"Votes computed"});

    }catch(error) {
        next(error);
    }
}