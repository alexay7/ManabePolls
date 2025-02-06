import {NextFunction, Request, Response} from "express";
import {pollService} from "../services/polls.service";
import {Types} from "mongoose";
import {TypedRequest, TypedRequestBody, TypedRequestParams} from "zod-express-middleware";
import {
    createOptionDto,
    createPollDto,
    pollEndpointParams,
    pollOptionEndpointParams,
    pollTypeEndpointParams
} from "../dto/poll.dto";
import {ZodNever} from "zod";
import {voteService} from "../services/vote.service";
import axios from "axios";
import {userService} from "../services/user.service";
import {config} from "../config/config";

export async function createPoll(req: TypedRequestBody<typeof createPollDto>, res: Response, next: NextFunction) {
    try {
        const result = await pollService.createPoll(req.body);

        if (!result) {
            return next({status: 500, message: "Poll creation failed"});
        }

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getPolls(_: Request, res: Response, next: NextFunction) {
    try {
        const polls = await pollService.getPolls();

        return res.json(polls);
    } catch (error) {
        next(error);
    }
}

export async function addOptionToPoll(req: TypedRequest<typeof pollTypeEndpointParams, ZodNever, typeof createOptionDto>, res: Response, next: NextFunction) {
    try {
        const pollId = new Types.ObjectId(req.params.pollId);
        const category = req.params.type;

        const option = req.body;

        const result = await pollService.addOptionToPoll(pollId, category, option);

        if (!result) {
            return next({status: 500, message: "Option addition failed"});
        }

        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function deleteOptionFromPoll(req: TypedRequestParams<typeof pollOptionEndpointParams>, res: Response, next: NextFunction) {
    try {
        const pollId = new Types.ObjectId(req.params.pollId);
        const category = req.params.type;
        const optionName = req.params.optionName;

        const result = await pollService.deleteOptionFromPoll(pollId, category, optionName);

        if (!result) {
            return next({status: 500, message: "Option deletion failed"});
        }

        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getActivePolls(_: Request, res: Response, next: NextFunction) {
    try {
        const polls = await pollService.getActivePolls();

        return res.json(polls);
    } catch (error) {
        next(error);
    }
}

export async function activatePoll(req: TypedRequestParams<typeof pollEndpointParams>, res: Response, next: NextFunction) {
    try {
        const pollId = new Types.ObjectId(req.params.pollId);

        const result = await pollService.activatePoll(pollId);

        if (!result) {
            return next({status: 500, message: "Poll activation failed"});
        }

        // Search for the last ended poll
        const [lastPoll] = await pollService.getLastPoll();

        // Calculate all the users that voted for anything
        const allVoters = await voteService.getTotalPollVoters(lastPoll._id);

        // Process tickets
        const rawRes = await axios.post<{
            userId: string,
            status: "bonus" | "penalty"
        }[]>(`${config.TICKETS_API_URL}/calculate-tickets`, {results: lastPoll.results});

        if (rawRes.status !== 201) {
            return next({status: 500, message: "Error calculating tickets"});
        }

        const userActions = rawRes.data;

        // Por cada usuario que merece premio o recompensa según sus logs, incrementar o decrementar tickets
        await Promise.all(userActions.map(async (action) => {
            if (action.status === "bonus") {
                // Don't increment tickets for users that didn't vote
                if (!allVoters.find((voter) => voter._id === action.userId)) {
                    console.log("User didn't vote, skipping increment");
                    return;
                }

                console.log("Incrementing tickets for user", action.userId);
                await userService.incrementUserTickets(action.userId);
            } else if (action.status === "penalty") {
                console.log("Decrementing tickets for user", action.userId);
                await userService.decrementUserTickets(action.userId);
            }
        }));

        return res.json(result);
    } catch (error) {
        next(error);
    }
}