import { Router } from "express";
import { customValidateRequest } from "../helpers/zod";
import { createVoteDto } from "../dto/vote.dto";
import { pollEndpointParams, pollTypeEndpointParams } from "../dto/poll.dto";
import { computePollVotes, createVote, getUserVotes } from "../controllers/vote.controller";
import { adminRoute, protectedRoute } from "../middlewares/protected";

const voteRouter = Router();

voteRouter.get("/:pollId",
    adminRoute,
    customValidateRequest({
        params:pollEndpointParams
    }),
    computePollVotes
);

voteRouter.get("/:pollId/myvotes",
    protectedRoute,
    customValidateRequest({
        params:pollEndpointParams
    }),
    getUserVotes
);

voteRouter.post("/:pollId/:type",
    protectedRoute,
    customValidateRequest({
        body:createVoteDto,
        params: pollTypeEndpointParams
    }),
    createVote
);

export default voteRouter;