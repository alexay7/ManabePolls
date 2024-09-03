import { NextFunction, Request, Response } from "express";
import { pollService } from "../services/polls.service";
import { Types } from "mongoose";
import { TypedRequest, TypedRequestBody, TypedRequestParams } from "zod-express-middleware";
import { createOptionDto, createPollDto, pollEndpointParams, pollOptionEndpointParams, pollTypeEndpointParams } from "../dto/poll.dto";
import { ZodNever } from "zod";

export async function createPoll(req: TypedRequestBody<typeof createPollDto>, res: Response,next: NextFunction) {
    try{
        const result = await pollService.createPoll(req.body);

        if (!result) {
            return next({ status: 500, message: "Poll creation failed" });
        }

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getPolls(_: Request, res: Response, next: NextFunction) {
    try{
        const polls = await pollService.getPolls();

        return res.json(polls);
    }catch (error) {
        next(error);
    }
}

export async function addOptionToPoll(req: TypedRequest<typeof pollTypeEndpointParams,ZodNever,typeof createOptionDto>, res: Response, next: NextFunction) {
    try{
        const pollId = new Types.ObjectId(req.params.pollId);
        const category = req.params.type;

        const option = req.body;

        const result = await pollService.addOptionToPoll(pollId, category, option);

        if (!result) {
            return next({ status: 500, message: "Option addition failed" });
        }

        return res.json(result);
    }catch (error) {
        next(error);
    }
}

export async function deleteOptionFromPoll(req: TypedRequestParams<typeof pollOptionEndpointParams>, res: Response, next: NextFunction) {
    try{
        const pollId = new Types.ObjectId(req.params.pollId);
        const category = req.params.type;
        const optionName = req.params.optionName;

        const result = await pollService.deleteOptionFromPoll(pollId, category, optionName);

        if (!result) {
            return next({ status: 500, message: "Option deletion failed" });
        }

        return res.json(result);
    }catch (error) {
        next(error);
    }
}

export async function getActivePolls(_: Request, res: Response, next: NextFunction) {
    try{
        const polls = await pollService.getActivePolls();

        return res.json(polls);
    }catch (error) {
        next(error);
    }
}

export async function activatePoll(req: TypedRequestParams<typeof pollEndpointParams>, res: Response, next: NextFunction) {
    try{
        const pollId = new Types.ObjectId(req.params.pollId);

        const result = await pollService.activatePoll(pollId);

        if (!result) {
            return next({ status: 500, message: "Poll activation failed" });
        }

        return res.json(result);
    }catch (error) {
        next(error);
    }
}